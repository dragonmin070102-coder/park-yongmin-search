create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_id text not null unique,
  event_name text not null,
  anonymous_user_id text not null,
  session_id text not null,
  path text,
  hash text,
  referrer text,
  user_agent text,
  viewport text,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

create index if not exists analytics_events_name_created_at_idx
  on public.analytics_events (event_name, created_at desc);

create index if not exists analytics_events_user_idx
  on public.analytics_events (anonymous_user_id);

alter table public.analytics_events enable row level security;

drop policy if exists "Allow anonymous analytics insert" on public.analytics_events;
create policy "Allow anonymous analytics insert"
  on public.analytics_events
  for insert
  to anon
  with check (true);

drop view if exists public.analytics_search_terms;
create view public.analytics_search_terms as
select
  properties->>'query' as query,
  count(*) as search_count,
  max(created_at) as last_searched_at
from public.analytics_events
where event_name in ('search', 'search_no_result')
  and coalesce(properties->>'query', '') <> ''
group by properties->>'query'
order by search_count desc, last_searched_at desc;

drop view if exists public.analytics_popular_resources;
create view public.analytics_popular_resources as
select
  properties->>'resourceId' as resource_id,
  properties->>'resourceTitle' as resource_title,
  count(*) as open_count,
  max(created_at) as last_opened_at
from public.analytics_events
where event_name in ('resource_open', 'drive_open')
group by properties->>'resourceId', properties->>'resourceTitle'
order by open_count desc, last_opened_at desc;

drop view if exists public.analytics_no_result_terms;
create view public.analytics_no_result_terms as
select
  properties->>'query' as query,
  count(*) as no_result_count,
  max(created_at) as last_searched_at
from public.analytics_events
where event_name = 'search_no_result'
  and coalesce(properties->>'query', '') <> ''
group by properties->>'query'
order by no_result_count desc, last_searched_at desc;
