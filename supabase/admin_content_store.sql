-- PYM Admin content store
-- Run in Supabase SQL editor when you want admin edits to sync across all users.

create table if not exists public.admin_resources (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_content_settings (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_resources enable row level security;
alter table public.admin_content_settings enable row level security;

-- Public read lets the static site load published admin content.
drop policy if exists "admin_resources_public_read" on public.admin_resources;
create policy "admin_resources_public_read"
  on public.admin_resources for select
  using (true);

drop policy if exists "admin_content_settings_public_read" on public.admin_content_settings;
create policy "admin_content_settings_public_read"
  on public.admin_content_settings for select
  using (true);

-- For early MVP only: anon upsert from the hidden admin route.
-- Before public launch, replace these with authenticated admin-only policies.
drop policy if exists "admin_resources_anon_upsert" on public.admin_resources;
create policy "admin_resources_anon_upsert"
  on public.admin_resources for insert
  with check (true);

drop policy if exists "admin_resources_anon_update" on public.admin_resources;
create policy "admin_resources_anon_update"
  on public.admin_resources for update
  using (true)
  with check (true);

drop policy if exists "admin_content_settings_anon_upsert" on public.admin_content_settings;
create policy "admin_content_settings_anon_upsert"
  on public.admin_content_settings for insert
  with check (true);

drop policy if exists "admin_content_settings_anon_update" on public.admin_content_settings;
create policy "admin_content_settings_anon_update"
  on public.admin_content_settings for update
  using (true)
  with check (true);

-- Storage bucket recommendation:
-- 1. Create bucket named `resources`.
-- 2. Keep it public only for free resources.
-- 3. Use a separate private bucket for paid premium files.
