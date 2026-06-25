-- PYM bank transfer purchase orders
-- Run this in Supabase SQL editor to let #admin see orders across devices/origins.

create table if not exists public.bank_transfer_orders (
  id text primary key,
  product_id text not null,
  product_title text not null,
  amount text not null,
  depositor text not null,
  email text not null,
  phone_last4 text,
  memo text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists bank_transfer_orders_created_at_idx
  on public.bank_transfer_orders (created_at desc);

create index if not exists bank_transfer_orders_status_idx
  on public.bank_transfer_orders (status, created_at desc);

alter table public.bank_transfer_orders enable row level security;

grant select, insert, update on public.bank_transfer_orders to anon;

-- MVP policy: the hidden admin route can read/update orders with the public anon key.
-- Before public launch, replace update/select with authenticated admin-only policies.
drop policy if exists "Allow anonymous bank order insert" on public.bank_transfer_orders;
create policy "Allow anonymous bank order insert"
  on public.bank_transfer_orders
  for insert
  to anon
  with check (true);

drop policy if exists "Allow anonymous bank order select" on public.bank_transfer_orders;
create policy "Allow anonymous bank order select"
  on public.bank_transfer_orders
  for select
  to anon
  using (true);

drop policy if exists "Allow anonymous bank order update" on public.bank_transfer_orders;
create policy "Allow anonymous bank order update"
  on public.bank_transfer_orders
  for update
  to anon
  using (true)
  with check (true);
