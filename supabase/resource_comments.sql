create table if not exists public.resource_comments (
  id bigint generated always as identity primary key,
  resource_id text not null,
  anonymous_user_id text not null,
  nickname text not null,
  body text not null check (char_length(body) between 1 and 300),
  likes integer not null default 0 check (likes >= 0),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists resource_comments_resource_created_idx
  on public.resource_comments (resource_id, created_at desc)
  where hidden = false;

alter table public.resource_comments enable row level security;

grant select, insert on public.resource_comments to anon;
revoke update on public.resource_comments from anon;
grant update (likes) on public.resource_comments to anon;

drop policy if exists "Allow anonymous resource comment read" on public.resource_comments;
create policy "Allow anonymous resource comment read"
  on public.resource_comments
  for select
  to anon
  using (hidden = false);

drop policy if exists "Allow anonymous resource comment insert" on public.resource_comments;
create policy "Allow anonymous resource comment insert"
  on public.resource_comments
  for insert
  to anon
  with check (
    hidden = false
    and char_length(body) between 1 and 300
    and char_length(nickname) between 2 and 32
    and char_length(resource_id) between 2 and 80
    and char_length(anonymous_user_id) between 8 and 80
  );

drop policy if exists "Allow anonymous resource comment like update" on public.resource_comments;
create policy "Allow anonymous resource comment like update"
  on public.resource_comments
  for update
  to anon
  using (hidden = false)
  with check (hidden = false and likes >= 0);

drop view if exists public.resource_discussion_stats;
create view public.resource_discussion_stats as
with resource_likes as (
  select
    properties->>'resourceId' as resource_id,
    count(*) as like_count
  from public.analytics_events
  where event_name = 'resource_like'
    and coalesce(properties->>'resourceId', '') <> ''
  group by properties->>'resourceId'
),
comment_stats as (
  select
    resource_id,
    count(*) filter (where hidden = false) as comment_count,
    coalesce(sum(likes) filter (where hidden = false), 0) as comment_like_count,
    max(created_at) filter (where hidden = false) as last_commented_at
  from public.resource_comments
  group by resource_id
)
select
  coalesce(resource_likes.resource_id, comment_stats.resource_id) as resource_id,
  coalesce(resource_likes.like_count, 0) as like_count,
  coalesce(comment_stats.comment_count, 0) as comment_count,
  coalesce(comment_stats.comment_like_count, 0) as comment_like_count,
  comment_stats.last_commented_at
from resource_likes
full outer join comment_stats using (resource_id);

grant select on public.resource_discussion_stats to anon;
