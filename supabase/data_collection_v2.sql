-- Data collection v2: server receipt observability, batch auditing, and DB-only order actions.

alter table public.analytics_events add column if not exists received_at timestamptz;
update public.analytics_events set received_at = created_at where received_at is null;
alter table public.analytics_events alter column received_at set default now();
alter table public.analytics_events alter column received_at set not null;
alter table public.analytics_events add column if not exists receipt_is_estimated boolean not null default false;
alter table public.analytics_events add column if not exists collection_version smallint not null default 1;
update public.analytics_events
set receipt_is_estimated = true
where collection_version = 1 and received_at = created_at;

create index if not exists analytics_events_received_at_idx
  on public.analytics_events (received_at desc);

create table if not exists private.analytics_ingestion_batches (
  id bigint generated always as identity primary key,
  client_hash text not null,
  received_count integer not null check (received_count between 1 and 20),
  accepted_count integer not null check (accepted_count between 0 and 20),
  collection_version smallint not null default 1,
  received_at timestamptz not null default now()
);

create index if not exists analytics_ingestion_batches_received_at_idx
  on private.analytics_ingestion_batches (received_at desc);

alter table private.analytics_ingestion_batches enable row level security;
revoke all on table private.analytics_ingestion_batches from public, anon, authenticated;

create or replace function public.submit_analytics_events(p_events jsonb, p_client_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  accepted_count integer := 0;
  received_count integer := 0;
  batch_version smallint := 1;
  batch_id bigint;
  batch_received_at timestamptz := clock_timestamp();
begin
  if jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) not between 1 and 20 then
    raise exception '이벤트 묶음이 올바르지 않습니다.' using errcode = '22023';
  end if;
  received_count := jsonb_array_length(p_events);
  perform private.consume_rate_limit(p_client_hash, 'analytics_batch', 120, interval '10 minutes');

  select greatest(1, least(32767, coalesce(max(
    case when coalesce(item->'properties'->>'analyticsVersion', '') ~ '^[0-9]{1,5}$'
      then (item->'properties'->>'analyticsVersion')::integer else 1 end
  ), 1)))::smallint
  into batch_version
  from jsonb_array_elements(p_events) item;

  insert into public.analytics_events (
    event_id, event_name, anonymous_user_id, session_id, path, hash, referrer,
    user_agent, viewport, properties, created_at, received_at, receipt_is_estimated, collection_version
  )
  select
    left(item->>'event_id', 100),
    left(item->>'event_name', 80),
    left(item->>'anonymous_user_id', 100),
    left(item->>'session_id', 100),
    left(coalesce(item->>'path', ''), 300),
    left(coalesce(item->>'hash', ''), 200),
    left(coalesce(item->>'referrer', ''), 500),
    left(coalesce(item->>'user_agent', ''), 500),
    left(coalesce(item->>'viewport', ''), 40),
    coalesce(item->'properties', '{}'::jsonb),
    coalesce(nullif(item->>'created_at', '')::timestamptz, batch_received_at),
    batch_received_at,
    false,
    case when coalesce(item->'properties'->>'analyticsVersion', '') ~ '^[0-9]{1,5}$'
      then greatest(1, least(32767, (item->'properties'->>'analyticsVersion')::integer))::smallint else 1 end
  from jsonb_array_elements(p_events) item
  where coalesce(item->>'event_id', '') ~ '^[A-Za-z0-9_.:-]{6,100}$'
    and coalesce(item->>'event_name', '') ~ '^[a-z0-9_]{2,80}$'
    and length(coalesce(item->>'anonymous_user_id', '')) between 8 and 100
    and length(coalesce(item->>'session_id', '')) between 8 and 100
    and jsonb_typeof(coalesce(item->'properties', '{}'::jsonb)) = 'object'
  on conflict (event_id) do nothing;

  get diagnostics accepted_count = row_count;
  insert into private.analytics_ingestion_batches (
    client_hash, received_count, accepted_count, collection_version, received_at
  ) values (
    p_client_hash, received_count, accepted_count, batch_version, batch_received_at
  ) returning id into batch_id;

  return jsonb_build_object(
    'accepted', accepted_count,
    'received', received_count,
    'batchId', batch_id,
    'receivedAt', batch_received_at,
    'collectionVersion', batch_version
  );
end;
$$;

create or replace function public.admin_analytics_export(p_secret text, p_days integer default 90)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  days integer := greatest(1, least(coalesce(p_days, 90), 365));
  cutoff timestamptz;
  payload jsonb;
begin
  perform private.assert_admin(p_secret);
  cutoff := now() - make_interval(days => days);

  select jsonb_build_object(
    'metadata', jsonb_build_object(
      'generatedAt', now(), 'periodDays', days, 'timezone', 'Asia/Seoul',
      'containsPersonalData', false, 'collectionDefinitionVersion', 2
    ),
    'summary', jsonb_build_object(
      'events', (select count(*) from public.analytics_events where created_at >= cutoff),
      'meaningfulEvents', (select count(*) from public.analytics_events where created_at >= cutoff
        and event_name not in ('home_notice_impression', 'home_premium_fixed_impression')),
      'users', (select count(distinct anonymous_user_id) from public.analytics_events where created_at >= cutoff),
      'sessions', (select count(distinct session_id) from public.analytics_events where created_at >= cutoff),
      'orders', (select count(*) from public.bank_transfer_orders where created_at >= cutoff),
      'approvedOrders', (select count(*) from public.bank_transfer_orders where created_at >= cutoff and status = 'approved'),
      'materialRequests', (select count(*) from public.premium_material_requests where created_at >= cutoff),
      'reviews', (select count(*) from public.premium_reviews where created_at >= cutoff)
    ),
    'daily', coalesce((select jsonb_agg(to_jsonb(x) order by x.day) from (
      select (created_at at time zone 'Asia/Seoul')::date as day,
        count(*) as events,
        count(*) filter (where event_name not in ('home_notice_impression', 'home_premium_fixed_impression')) as meaningful_events,
        count(*) filter (where event_name = 'home_notice_impression') as notice_impressions,
        count(distinct anonymous_user_id) as users,
        count(distinct session_id) as sessions,
        count(*) filter (where event_name = 'page_view') as page_views,
        count(*) filter (where event_name = 'search') as searches,
        count(*) filter (where event_name = 'search_no_result') as no_result_searches,
        count(*) filter (where event_name = 'resource_open') as resource_opens,
        count(*) filter (where event_name = 'drive_open') as drive_opens,
        count(*) filter (where event_name = 'premium_view') as premium_views,
        count(*) filter (where event_name = 'premium_checkout_click') as checkout_clicks,
        count(*) filter (where event_name = 'bank_transfer_order_submit') as order_submits
      from public.analytics_events where created_at >= cutoff group by 1
    ) x), '[]'::jsonb),
    'eventMix', coalesce((select jsonb_agg(to_jsonb(x) order by x.events desc) from (
      select event_name, count(*) as events, count(distinct anonymous_user_id) as users,
        count(distinct session_id) as sessions, min(created_at) as first_seen, max(created_at) as last_seen
      from public.analytics_events where created_at >= cutoff group by event_name
    ) x), '[]'::jsonb),
    'searchTerms', coalesce((select jsonb_agg(to_jsonb(x) order by x.searches desc, x.query) from (
      select lower(trim(properties->>'query')) as query,
        count(*) filter (where event_name = 'search') as searches,
        count(*) filter (where event_name = 'search_no_result') as no_result_searches,
        count(distinct anonymous_user_id) as users
      from public.analytics_events
      where created_at >= cutoff and event_name in ('search', 'search_no_result')
        and length(trim(coalesce(properties->>'query', ''))) > 0
      group by 1 order by searches desc limit 200
    ) x), '[]'::jsonb),
    'resources', coalesce((select jsonb_agg(to_jsonb(x) order by x.opens desc, x.resource_id) from (
      select coalesce(nullif(properties->>'resourceId', ''), 'unknown') as resource_id,
        count(*) filter (where event_name in ('resource_open', 'drive_open')) as opens,
        count(*) filter (where event_name = 'resource_like') as likes,
        count(distinct anonymous_user_id) as users
      from public.analytics_events
      where created_at >= cutoff and event_name in ('resource_open', 'drive_open', 'resource_like')
      group by 1
    ) x), '[]'::jsonb),
    'funnel', (select to_jsonb(x) from (
      select
        count(distinct anonymous_user_id) filter (where event_name = 'page_view') as visitors,
        count(distinct anonymous_user_id) filter (where event_name = 'premium_view') as premium_visitors,
        count(distinct anonymous_user_id) filter (where event_name = 'home_premium_banner_click') as banner_clickers,
        count(distinct anonymous_user_id) filter (where event_name = 'premium_checkout_click') as checkout_clickers,
        count(distinct anonymous_user_id) filter (where event_name = 'bank_transfer_order_submit') as order_submitters,
        count(distinct anonymous_user_id) filter (where event_name = 'premium_secure_file_click') as file_openers
      from public.analytics_events where created_at >= cutoff
    ) x),
    'collectionHealth', jsonb_build_object(
      'latestReceivedAt', (select max(received_at) from public.analytics_events),
      'freshnessMinutes', (select round((extract(epoch from (now() - max(received_at))) / 60)::numeric, 2) from public.analytics_events),
      'batches', (select count(*) from private.analytics_ingestion_batches where received_at >= cutoff),
      'eventsReceived', (select coalesce(sum(received_count), 0) from private.analytics_ingestion_batches where received_at >= cutoff),
      'eventsAccepted', (select coalesce(sum(accepted_count), 0) from private.analytics_ingestion_batches where received_at >= cutoff),
      'acceptanceRate', (select round((coalesce(sum(accepted_count), 0)::numeric / nullif(sum(received_count), 0)), 4)
        from private.analytics_ingestion_batches where received_at >= cutoff),
      'averageBatchSize', (select round(avg(received_count)::numeric, 2) from private.analytics_ingestion_batches where received_at >= cutoff),
      'eventDelayP50Seconds', (select round(percentile_cont(0.5) within group
        (order by extract(epoch from (received_at - created_at)))::numeric, 2)
        from public.analytics_events where received_at >= cutoff and receipt_is_estimated = false),
      'eventDelayP95Seconds', (select round(percentile_cont(0.95) within group
        (order by extract(epoch from (received_at - created_at)))::numeric, 2)
        from public.analytics_events where received_at >= cutoff and receipt_is_estimated = false),
      'passiveEventShare', (select round((count(*) filter (where event_name in ('home_notice_impression', 'home_premium_fixed_impression'))::numeric
        / nullif(count(*), 0)), 4) from public.analytics_events where created_at >= cutoff),
      'version2Events', (select count(*) from public.analytics_events where created_at >= cutoff and collection_version >= 2)
    ),
    'quality', (select to_jsonb(x) from (
      select count(*) as rows,
        count(*) - count(distinct event_id) as duplicate_event_ids,
        count(*) filter (where event_id is null or event_name is null or anonymous_user_id is null or session_id is null) as missing_required,
        count(*) filter (where created_at > now() + interval '5 minutes') as future_rows,
        count(*) filter (where receipt_is_estimated) as legacy_receipt_rows,
        count(distinct event_name) as event_types
      from public.analytics_events where created_at >= cutoff
    ) x)
  ) into payload;
  return payload;
end;
$$;

create or replace function public.admin_update_bank_order(p_secret text, p_order_id text, p_action text)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  changed public.bank_transfer_orders%rowtype;
begin
  perform private.assert_admin(p_secret);
  if p_action = 'delete' then
    delete from public.bank_transfer_orders where id = upper(trim(p_order_id)) returning * into changed;
    return jsonb_build_object('ok', changed.id is not null, 'missing', changed.id is null, 'id', changed.id, 'action', 'delete');
  elsif p_action = 'approve' then
    update public.bank_transfer_orders
    set status = 'approved', approved_at = coalesce(approved_at, now()), updated_at = now()
    where id = upper(trim(p_order_id))
    returning * into changed;
    if changed.id is null then
      return jsonb_build_object('ok', false, 'missing', true, 'id', upper(trim(p_order_id)), 'action', 'approve');
    end if;
    return jsonb_build_object(
      'ok', true, 'id', changed.id, 'productId', changed.product_id, 'status', changed.status,
      'approvedAt', changed.approved_at, 'updatedAt', changed.updated_at
    );
  end if;
  raise exception '지원하지 않는 작업입니다.' using errcode = '22023';
end;
$$;

revoke all on function public.submit_analytics_events(jsonb, text) from public;
grant execute on function public.submit_analytics_events(jsonb, text) to anon;
revoke execute on function public.submit_analytics_events(jsonb, text) from authenticated;
revoke all on function public.admin_analytics_export(text, integer) from public;
grant execute on function public.admin_analytics_export(text, integer) to anon;
revoke execute on function public.admin_analytics_export(text, integer) from authenticated;
revoke all on function public.admin_update_bank_order(text, text, text) from public;
grant execute on function public.admin_update_bank_order(text, text, text) to anon;
revoke execute on function public.admin_update_bank_order(text, text, text) from authenticated;
