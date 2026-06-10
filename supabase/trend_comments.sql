create table if not exists public.trend_comments (
  id bigint generated always as identity primary key,
  article_id text not null,
  anonymous_user_id text not null,
  nickname text not null,
  body text not null check (char_length(body) between 1 and 300),
  likes integer not null default 0 check (likes >= 0),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists trend_comments_article_created_idx
  on public.trend_comments (article_id, created_at desc)
  where hidden = false;

alter table public.trend_comments enable row level security;

grant select, insert on public.trend_comments to anon;
revoke update on public.trend_comments from anon;
grant update (likes) on public.trend_comments to anon;

drop policy if exists "Allow anonymous comment read" on public.trend_comments;
create policy "Allow anonymous comment read"
  on public.trend_comments
  for select
  to anon
  using (hidden = false);

drop policy if exists "Allow anonymous comment insert" on public.trend_comments;
create policy "Allow anonymous comment insert"
  on public.trend_comments
  for insert
  to anon
  with check (
    hidden = false
    and char_length(body) between 1 and 300
    and char_length(nickname) between 2 and 32
    and char_length(article_id) between 2 and 80
    and char_length(anonymous_user_id) between 8 and 80
  );

drop policy if exists "Allow anonymous comment like update" on public.trend_comments;
create policy "Allow anonymous comment like update"
  on public.trend_comments
  for update
  to anon
  using (hidden = false)
  with check (hidden = false and likes >= 0);
