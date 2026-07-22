-- Private, append-only recovery trail for operational tables.
-- This protects against application-level UPDATE/DELETE mistakes. It is not a
-- substitute for an off-site logical backup or Supabase PITR.

create table if not exists private.operational_change_audit (
  id bigint generated always as identity primary key,
  table_name text not null,
  operation text not null check (operation in ('BASELINE', 'UPDATE', 'DELETE')),
  record_key text not null,
  old_row jsonb,
  new_row jsonb,
  changed_at timestamptz not null default clock_timestamp(),
  changed_by text not null default current_user
);

create index if not exists operational_change_audit_lookup_idx
  on private.operational_change_audit (table_name, record_key, changed_at desc);

alter table private.operational_change_audit enable row level security;
revoke all on table private.operational_change_audit from public, anon, authenticated, service_role;

create or replace function private.capture_operational_change()
returns trigger
language plpgsql
security definer
set search_path = private, pg_temp
as $$
declare
  old_payload jsonb := to_jsonb(old);
  new_payload jsonb := case when tg_op = 'UPDATE' then to_jsonb(new) else null end;
  key_value text;
begin
  key_value := coalesce(
    old_payload->>'id',
    old_payload->>'setting_key',
    old_payload->>'event_id',
    'unknown'
  );

  if tg_op = 'UPDATE' and old_payload = new_payload then
    return new;
  end if;

  insert into private.operational_change_audit (
    table_name, operation, record_key, old_row, new_row
  ) values (
    tg_table_schema || '.' || tg_table_name, tg_op, key_value, old_payload, new_payload
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function private.capture_operational_change() from public, anon, authenticated, service_role;

drop trigger if exists audit_bank_transfer_orders_change on public.bank_transfer_orders;
create trigger audit_bank_transfer_orders_change
before update or delete on public.bank_transfer_orders
for each row execute function private.capture_operational_change();

drop trigger if exists audit_premium_reviews_change on public.premium_reviews;
create trigger audit_premium_reviews_change
before update or delete on public.premium_reviews
for each row execute function private.capture_operational_change();

drop trigger if exists audit_premium_material_requests_change on public.premium_material_requests;
create trigger audit_premium_material_requests_change
before update or delete on public.premium_material_requests
for each row execute function private.capture_operational_change();

drop trigger if exists audit_premium_settings_change on public.premium_settings;
create trigger audit_premium_settings_change
before update or delete on public.premium_settings
for each row execute function private.capture_operational_change();

drop trigger if exists audit_trend_comments_delete on public.trend_comments;
create trigger audit_trend_comments_delete
before delete on public.trend_comments
for each row execute function private.capture_operational_change();

drop trigger if exists audit_resource_comments_delete on public.resource_comments;
create trigger audit_resource_comments_delete
before delete on public.resource_comments
for each row execute function private.capture_operational_change();

drop trigger if exists audit_analytics_events_delete on public.analytics_events;
create trigger audit_analytics_events_delete
before delete on public.analytics_events
for each row execute function private.capture_operational_change();

-- Point-in-time baseline for the current operational state. The rows remain in
-- the private schema and are inaccessible to application roles.
insert into private.operational_change_audit (table_name, operation, record_key, old_row)
select 'public.bank_transfer_orders', 'BASELINE', id, to_jsonb(row_data)
from public.bank_transfer_orders row_data;

insert into private.operational_change_audit (table_name, operation, record_key, old_row)
select 'public.premium_reviews', 'BASELINE', id::text, to_jsonb(row_data)
from public.premium_reviews row_data;

insert into private.operational_change_audit (table_name, operation, record_key, old_row)
select 'public.premium_material_requests', 'BASELINE', id::text, to_jsonb(row_data)
from public.premium_material_requests row_data;

insert into private.operational_change_audit (table_name, operation, record_key, old_row)
select 'public.premium_settings', 'BASELINE', setting_key, to_jsonb(row_data)
from public.premium_settings row_data;

insert into private.operational_change_audit (table_name, operation, record_key, old_row)
select 'public.trend_comments', 'BASELINE', id::text, to_jsonb(row_data)
from public.trend_comments row_data;

insert into private.operational_change_audit (table_name, operation, record_key, old_row)
select 'public.resource_comments', 'BASELINE', id::text, to_jsonb(row_data)
from public.resource_comments row_data;

create table if not exists private.database_integrity_snapshots (
  id bigint generated always as identity primary key,
  row_counts jsonb not null,
  fingerprints jsonb not null,
  captured_at timestamptz not null default clock_timestamp()
);

alter table private.database_integrity_snapshots enable row level security;
revoke all on table private.database_integrity_snapshots from public, anon, authenticated, service_role;

create or replace function private.capture_database_integrity_snapshot()
returns bigint
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  snapshot_id bigint;
begin
  insert into private.database_integrity_snapshots (row_counts, fingerprints)
  values (
    jsonb_build_object(
      'analyticsEvents', (select count(*) from public.analytics_events),
      'bankOrders', (select count(*) from public.bank_transfer_orders),
      'premiumReviews', (select count(*) from public.premium_reviews),
      'materialRequests', (select count(*) from public.premium_material_requests),
      'premiumSettings', (select count(*) from public.premium_settings),
      'trendComments', (select count(*) from public.trend_comments),
      'resourceComments', (select count(*) from public.resource_comments)
    ),
    jsonb_build_object(
      'analyticsEvents', (select md5(coalesce(string_agg(event_id || ':' || created_at::text, '|' order by event_id), '')) from public.analytics_events),
      'bankOrders', (select md5(coalesce(string_agg(id || ':' || status || ':' || updated_at::text, '|' order by id), '')) from public.bank_transfer_orders),
      'premiumReviews', (select md5(coalesce(string_agg(id::text || ':' || created_at::text, '|' order by id), '')) from public.premium_reviews),
      'materialRequests', (select md5(coalesce(string_agg(id::text || ':' || status || ':' || created_at::text, '|' order by id), '')) from public.premium_material_requests),
      'premiumSettings', (select md5(coalesce(string_agg(setting_key || ':' || updated_at::text, '|' order by setting_key), '')) from public.premium_settings),
      'trendComments', (select md5(coalesce(string_agg(id::text || ':' || created_at::text, '|' order by id), '')) from public.trend_comments),
      'resourceComments', (select md5(coalesce(string_agg(id::text || ':' || created_at::text, '|' order by id), '')) from public.resource_comments)
    )
  ) returning id into snapshot_id;
  return snapshot_id;
end;
$$;

revoke all on function private.capture_database_integrity_snapshot() from public, anon, authenticated, service_role;

select private.capture_database_integrity_snapshot();
