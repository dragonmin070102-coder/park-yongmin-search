-- Secure commerce boundary for PYM Search.
-- Public clients may submit analytics and call narrowly-scoped RPC functions.
-- Orders, premium file links, and admin analytics are never directly readable by anon.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_config (
  config_key text primary key,
  secret_hash text not null,
  updated_at timestamptz not null default now()
);

create table if not exists private.rate_limit_log (
  id bigint generated always as identity primary key,
  client_hash text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_log_lookup_idx
  on private.rate_limit_log (client_hash, action, created_at desc);

alter table public.bank_transfer_orders
  add column if not exists client_hash text;

create table if not exists public.premium_reviews (
  id bigint generated always as identity primary key,
  order_id text not null unique references public.bank_transfer_orders(id) on delete cascade,
  product_id text not null,
  nickname text not null,
  body text not null check (char_length(body) between 5 and 300),
  created_at timestamptz not null default now()
);

alter table public.premium_reviews enable row level security;
revoke all on table public.premium_reviews from anon, authenticated;
grant select, insert, update, delete on table public.premium_reviews to service_role;

revoke all on table public.bank_transfer_orders from anon, authenticated;
grant select, insert, update, delete on table public.bank_transfer_orders to service_role;

drop policy if exists "Allow anonymous bank order insert" on public.bank_transfer_orders;
drop policy if exists "Allow anonymous bank order select" on public.bank_transfer_orders;
drop policy if exists "Allow anonymous bank order update" on public.bank_transfer_orders;
drop policy if exists "Allow anonymous bank order delete" on public.bank_transfer_orders;

revoke all on table public.premium_settings from anon, authenticated;
grant select, insert, update, delete on table public.premium_settings to service_role;

drop policy if exists "premium_settings_public_read" on public.premium_settings;
drop policy if exists "premium_settings_public_write" on public.premium_settings;
drop policy if exists "premium_settings_public_update" on public.premium_settings;

revoke all on table public.analytics_events from anon, authenticated;
grant select, insert, update, delete on table public.analytics_events to service_role;
drop policy if exists "Allow anonymous analytics event select" on public.analytics_events;
drop policy if exists "Allow anonymous analytics insert" on public.analytics_events;

create or replace function private.assert_admin(p_secret text)
returns void
language plpgsql
security definer
set search_path = private, extensions, pg_temp
as $$
declare
  expected_hash text;
begin
  select secret_hash into expected_hash
  from private.app_config
  where config_key = 'admin_access';

  if expected_hash is null
     or encode(extensions.digest(coalesce(p_secret, ''), 'sha256'), 'hex') <> expected_hash then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;
end;
$$;

revoke all on function private.assert_admin(text) from public, anon, authenticated;

create or replace function private.consume_rate_limit(
  p_client_hash text,
  p_action text,
  p_limit integer,
  p_window interval
)
returns void
language plpgsql
security definer
set search_path = private, pg_temp
as $$
declare
  recent_count integer;
begin
  if coalesce(length(p_client_hash), 0) < 16 then
    raise exception 'Invalid client' using errcode = '22023';
  end if;

  delete from private.rate_limit_log
  where client_hash = p_client_hash
    and created_at < now() - interval '1 day';

  select count(*) into recent_count
  from private.rate_limit_log
  where client_hash = p_client_hash
    and action = p_action
    and created_at >= now() - p_window;

  if recent_count >= p_limit then
    raise exception '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' using errcode = 'P0001';
  end if;

  insert into private.rate_limit_log (client_hash, action)
  values (p_client_hash, p_action);
end;
$$;

revoke all on function private.consume_rate_limit(text, text, integer, interval) from public, anon, authenticated;

create or replace function public.submit_analytics_events(p_events jsonb, p_client_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  accepted_count integer := 0;
begin
  if jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) not between 1 and 20 then
    raise exception '이벤트 묶음이 올바르지 않습니다.' using errcode = '22023';
  end if;
  perform private.consume_rate_limit(p_client_hash, 'analytics_batch', 120, interval '10 minutes');

  insert into public.analytics_events (
    event_id, event_name, anonymous_user_id, session_id, path, hash, referrer,
    user_agent, viewport, properties, created_at
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
    coalesce(nullif(item->>'created_at', '')::timestamptz, now())
  from jsonb_array_elements(p_events) item
  where coalesce(item->>'event_id', '') ~ '^[A-Za-z0-9_.:-]{6,100}$'
    and coalesce(item->>'event_name', '') ~ '^[a-z0-9_]{2,80}$'
    and length(coalesce(item->>'anonymous_user_id', '')) between 8 and 100
    and length(coalesce(item->>'session_id', '')) between 8 and 100
    and jsonb_typeof(coalesce(item->'properties', '{}'::jsonb)) = 'object'
  on conflict (event_id) do nothing;

  get diagnostics accepted_count = row_count;
  return jsonb_build_object('accepted', accepted_count);
end;
$$;

create or replace function public.get_public_premium_settings()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'account', coalesce((select account from public.premium_settings where setting_key = 'neuro-series-6'), '{}'::jsonb),
    'updatedAt', coalesce((select updated_at from public.premium_settings where setting_key = 'neuro-series-6'), now())
  );
$$;

create or replace function public.get_public_premium_social_proof()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'accessCount', (
      select count(*) from public.analytics_events
      where event_name = 'premium_secure_file_click'
    ),
    'reviews', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id,
        'name', left(nickname, 40),
        'body', left(body, 300),
        'createdAt', created_at
      ) order by created_at desc)
      from (
        select id, nickname, body, created_at
        from public.premium_reviews
        order by created_at desc
        limit 20
      ) review_rows
    ), '[]'::jsonb)
  );
$$;

create or replace function public.get_public_content_stats()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with resource_views as (
    select properties->>'resourceId' as resource_id, count(*) as open_count
    from public.analytics_events
    where event_name in ('resource_open', 'drive_open')
      and coalesce(properties->>'resourceId', '') <> ''
    group by properties->>'resourceId'
  ),
  resource_likes as (
    select properties->>'resourceId' as resource_id, count(*) as like_count
    from public.analytics_events
    where event_name = 'resource_like'
      and coalesce(properties->>'resourceId', '') <> ''
    group by properties->>'resourceId'
  ),
  resource_comment_stats as (
    select resource_id, count(*) filter (where hidden = false) as comment_count
    from public.resource_comments group by resource_id
  ),
  trend_views as (
    select properties->>'articleId' as article_id, count(*) as view_count
    from public.analytics_events
    where event_name = 'trend_article_open'
      and coalesce(properties->>'articleId', '') <> ''
    group by properties->>'articleId'
  ),
  trend_comment_stats as (
    select article_id,
      count(*) filter (where hidden = false) as comment_count,
      coalesce(sum(likes) filter (where hidden = false), 0) as like_count
    from public.trend_comments group by article_id
  )
  select jsonb_build_object(
    'resources', coalesce((select jsonb_agg(jsonb_build_object('resource_id', resource_id, 'open_count', open_count)) from resource_views), '[]'::jsonb),
    'resourceDiscussion', coalesce((
      select jsonb_agg(jsonb_build_object(
        'resource_id', coalesce(l.resource_id, c.resource_id),
        'like_count', coalesce(l.like_count, 0),
        'comment_count', coalesce(c.comment_count, 0)
      )) from resource_likes l full outer join resource_comment_stats c using (resource_id)
    ), '[]'::jsonb),
    'trends', coalesce((
      select jsonb_agg(jsonb_build_object(
        'article_id', coalesce(v.article_id, c.article_id),
        'view_count', coalesce(v.view_count, 0),
        'comment_count', coalesce(c.comment_count, 0),
        'like_count', coalesce(c.like_count, 0)
      )) from trend_views v full outer join trend_comment_stats c using (article_id)
    ), '[]'::jsonb)
  );
$$;

create or replace function public.submit_bank_order(
  p_product_id text,
  p_depositor text,
  p_email text,
  p_phone_last4 text,
  p_memo text,
  p_client_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  new_id text;
  configured_amount text;
  inserted public.bank_transfer_orders%rowtype;
begin
  perform private.consume_rate_limit(p_client_hash, 'order_create', 3, interval '15 minutes');

  if p_product_id <> 'neuro-series-6'
     or length(trim(p_depositor)) not between 2 and 80
     or length(trim(p_email)) not between 5 and 160
     or trim(p_email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or p_phone_last4 !~ '^[0-9]{4}$' then
    raise exception '입력 정보를 확인해 주세요.' using errcode = '22023';
  end if;

  configured_amount := coalesce(
    (select nullif(account->>'amount', '') from public.premium_settings where setting_key = 'neuro-series-6'),
    '3,900원'
  );
  new_id := 'PYM-' || to_char(current_date, 'MMDD') || '-' || upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 4));

  insert into public.bank_transfer_orders (
    id, product_id, product_title, amount, depositor, email, phone_last4, memo,
    status, created_at, updated_at, client_hash
  ) values (
    new_id, 'neuro-series-6', '신경계 임상추론 시리즈 6편', configured_amount,
    trim(p_depositor), lower(trim(p_email)), p_phone_last4, left(coalesce(p_memo, ''), 300),
    'pending', now(), now(), p_client_hash
  ) returning * into inserted;

  return jsonb_build_object(
    'id', inserted.id,
    'productId', inserted.product_id,
    'productTitle', inserted.product_title,
    'amount', inserted.amount,
    'depositor', inserted.depositor,
    'email', inserted.email,
    'phoneLast4', inserted.phone_last4,
    'memo', inserted.memo,
    'status', inserted.status,
    'createdAt', inserted.created_at,
    'updatedAt', inserted.updated_at
  );
end;
$$;

create or replace function public.submit_premium_review(
  p_order_id text,
  p_email text,
  p_phone_last4 text,
  p_body text,
  p_client_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  found public.bank_transfer_orders%rowtype;
  review_row public.premium_reviews%rowtype;
  nickname text;
begin
  perform private.consume_rate_limit(p_client_hash, 'review_submit', 5, interval '1 hour');
  select * into found
  from public.bank_transfer_orders
  where id = upper(trim(p_order_id))
    and lower(email) = lower(trim(p_email))
    and phone_last4 = p_phone_last4
    and status = 'approved'
  limit 1;
  if found.id is null then raise exception '승인된 구매를 확인할 수 없습니다.' using errcode = '42501'; end if;
  if length(trim(p_body)) not between 5 and 300 then raise exception '리뷰는 5자 이상 300자 이하로 입력해 주세요.' using errcode = '22023'; end if;

  nickname := '구매자_' || upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 4));
  insert into public.premium_reviews (order_id, product_id, nickname, body)
  values (found.id, found.product_id, nickname, trim(p_body))
  on conflict (order_id) do update set body = excluded.body
  returning * into review_row;

  return jsonb_build_object('id', review_row.id, 'name', review_row.nickname, 'body', review_row.body, 'createdAt', review_row.created_at);
end;
$$;

create or replace function public.lookup_bank_order(
  p_order_id text,
  p_email text,
  p_phone_last4 text,
  p_client_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  found public.bank_transfer_orders%rowtype;
  links jsonb := '{}'::jsonb;
begin
  perform private.consume_rate_limit(p_client_hash, 'order_lookup', 30, interval '10 minutes');
  select * into found
  from public.bank_transfer_orders
  where id = upper(trim(p_order_id))
    and lower(email) = lower(trim(p_email))
    and phone_last4 = p_phone_last4
  limit 1;

  if found.id is null then return null; end if;
  if found.status = 'approved' then
    select coalesce(file_links, '{}'::jsonb) into links
    from public.premium_settings where setting_key = found.product_id;
  end if;

  return jsonb_build_object(
    'id', found.id, 'productId', found.product_id, 'productTitle', found.product_title,
    'amount', found.amount, 'depositor', found.depositor, 'email', found.email,
    'phoneLast4', found.phone_last4, 'status', found.status,
    'createdAt', found.created_at, 'approvedAt', found.approved_at,
    'updatedAt', found.updated_at, 'fileLinks', links
  );
end;
$$;

create or replace function public.find_bank_order(
  p_depositor text,
  p_email text,
  p_phone_last4 text,
  p_client_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  found_id text;
begin
  perform private.consume_rate_limit(p_client_hash, 'identity_lookup', 20, interval '10 minutes');
  select id into found_id
  from public.bank_transfer_orders
  where lower(depositor) = lower(trim(p_depositor))
    and lower(email) = lower(trim(p_email))
    and phone_last4 = p_phone_last4
  order by created_at desc
  limit 1;

  if found_id is null then return null; end if;
  return public.lookup_bank_order(found_id, p_email, p_phone_last4, p_client_hash);
end;
$$;

create or replace function public.admin_dashboard_payload(p_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  payload jsonb;
begin
  perform private.assert_admin(p_secret);
  select jsonb_build_object(
    'rawEvents', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (
      select event_id, event_name, anonymous_user_id, session_id, path, hash, referrer, user_agent, viewport, properties, created_at
      from public.analytics_events order by created_at desc limit 5000
    ) x), '[]'::jsonb),
    'trendComments', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (
      select id, article_id, nickname, body, likes, created_at from public.trend_comments where hidden = false order by created_at desc limit 1000
    ) x), '[]'::jsonb),
    'resourceComments', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (
      select id, resource_id, nickname, body, likes, created_at from public.resource_comments where hidden = false order by created_at desc limit 1000
    ) x), '[]'::jsonb),
    'bankOrders', coalesce((select jsonb_agg(jsonb_build_object(
      'id', id, 'productId', product_id, 'productTitle', product_title, 'amount', amount,
      'depositor', depositor, 'email', email, 'phoneLast4', phone_last4, 'memo', memo,
      'status', status, 'createdAt', created_at, 'approvedAt', approved_at, 'updatedAt', updated_at
    ) order by created_at desc) from (select * from public.bank_transfer_orders order by created_at desc limit 300) orders), '[]'::jsonb),
    'settings', coalesce((select jsonb_build_object('account', account, 'fileLinks', file_links, 'updatedAt', updated_at)
      from public.premium_settings where setting_key = 'neuro-series-6'), '{}'::jsonb),
    'exactCounts', jsonb_build_object(
      'totalEvents', (select count(*) from public.analytics_events),
      'totalPageViews', (select count(*) from public.analytics_events where event_name = 'page_view'),
      'premiumViews', (select count(*) from public.analytics_events where event_name = 'premium_view'),
      'bannerClicks', (select count(*) from public.analytics_events where event_name = 'home_premium_banner_click'),
      'fileOpens', (select count(*) from public.analytics_events where event_name = 'premium_secure_file_click')
    )
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
    return jsonb_build_object('ok', changed.id is not null, 'id', changed.id, 'action', 'delete');
  elsif p_action = 'approve' then
    update public.bank_transfer_orders
    set status = 'approved', approved_at = coalesce(approved_at, now()), updated_at = now()
    where id = upper(trim(p_order_id))
    returning * into changed;
    if changed.id is null then raise exception '주문을 찾지 못했습니다.' using errcode = 'P0002'; end if;
    return jsonb_build_object(
      'ok', true, 'id', changed.id, 'productId', changed.product_id, 'status', changed.status,
      'approvedAt', changed.approved_at, 'updatedAt', changed.updated_at
    );
  end if;
  raise exception '지원하지 않는 작업입니다.' using errcode = '22023';
end;
$$;

create or replace function public.admin_save_premium_settings(p_secret text, p_account jsonb, p_file_links jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  perform private.assert_admin(p_secret);
  insert into public.premium_settings (setting_key, account, file_links, updated_at)
  values ('neuro-series-6', coalesce(p_account, '{}'::jsonb), coalesce(p_file_links, '{}'::jsonb), now())
  on conflict (setting_key) do update
  set account = excluded.account, file_links = excluded.file_links, updated_at = excluded.updated_at;
  return jsonb_build_object('ok', true, 'updatedAt', now());
end;
$$;

revoke all on function public.get_public_premium_settings() from public;
revoke all on function public.submit_analytics_events(jsonb, text) from public;
revoke all on function public.get_public_premium_social_proof() from public;
revoke all on function public.get_public_content_stats() from public;
revoke all on function public.submit_bank_order(text, text, text, text, text, text) from public;
revoke all on function public.lookup_bank_order(text, text, text, text) from public;
revoke all on function public.find_bank_order(text, text, text, text) from public;
revoke all on function public.submit_premium_review(text, text, text, text, text) from public;
revoke all on function public.admin_dashboard_payload(text) from public;
revoke all on function public.admin_update_bank_order(text, text, text) from public;
revoke all on function public.admin_save_premium_settings(text, jsonb, jsonb) from public;

grant execute on function public.get_public_premium_settings() to anon, authenticated;
grant execute on function public.submit_analytics_events(jsonb, text) to anon, authenticated;
grant execute on function public.get_public_premium_social_proof() to anon, authenticated;
grant execute on function public.get_public_content_stats() to anon, authenticated;
grant execute on function public.submit_bank_order(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.lookup_bank_order(text, text, text, text) to anon, authenticated;
grant execute on function public.find_bank_order(text, text, text, text) to anon, authenticated;
grant execute on function public.submit_premium_review(text, text, text, text, text) to anon, authenticated;
grant execute on function public.admin_dashboard_payload(text) to anon;
grant execute on function public.admin_update_bank_order(text, text, text) to anon;
grant execute on function public.admin_save_premium_settings(text, jsonb, jsonb) to anon;

revoke execute on function public.admin_dashboard_payload(text) from authenticated;
revoke execute on function public.admin_update_bank_order(text, text, text) from authenticated;
revoke execute on function public.admin_save_premium_settings(text, jsonb, jsonb) from authenticated;

alter view if exists public.analytics_search_terms set (security_invoker = true);
alter view if exists public.analytics_popular_resources set (security_invoker = true);
alter view if exists public.analytics_no_result_terms set (security_invoker = true);
alter view if exists public.resource_discussion_stats set (security_invoker = true);
revoke all on public.analytics_search_terms, public.analytics_popular_resources, public.analytics_no_result_terms,
  public.resource_discussion_stats from anon, authenticated;
