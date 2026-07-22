-- Add the paid lab interpretation series while preserving the existing neuro product.

insert into public.premium_settings (setting_key, account, file_links, updated_at)
select
  'lab-series-6',
  coalesce(account, '{}'::jsonb),
  jsonb_build_object(
    '01', 'https://docs.google.com/document/d/1VKrJQ9fJYX8affkhk50z4O0BeowrxyOZrmsVlwRdRlc/edit',
    '02', 'https://docs.google.com/document/d/1q4e69RgaBpU-pHJkzwdT5IPubKcewRIgcJif9iNd6pE/edit',
    '03', 'https://docs.google.com/document/d/10DUv4xzR_F-iMLJ-3TEN1WkuTSpYLd2HyIJHtiYpRMc/edit',
    '04', 'https://docs.google.com/document/d/1ViENPMuCzrIrtMdUyBFF4SVXEafUHDBRd9XIHkW9oWg/edit',
    '05', 'https://docs.google.com/document/d/1pr5FvGoMvKRc-6asZTVochfh4uSvyKmPils_ylHhV7k/edit',
    '06', 'https://docs.google.com/document/d/15hEPcHvcC_C3quOAS0_IQM9QXaRNKZUgrN1okmJ3MI8/edit'
  ),
  now()
from public.premium_settings
where setting_key = 'neuro-series-6'
on conflict (setting_key) do update
set
  account = excluded.account,
  file_links = excluded.file_links,
  updated_at = excluded.updated_at;

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
  configured_title text;
  inserted public.bank_transfer_orders%rowtype;
begin
  perform private.consume_rate_limit(p_client_hash, 'order_create', 3, interval '15 minutes');

  configured_title := case p_product_id
    when 'neuro-series-6' then '신경계 임상추론 시리즈 6편'
    when 'lab-series-6' then '검사수치 임상추론 시리즈 6편'
    else null
  end;

  if configured_title is null
     or length(trim(p_depositor)) not between 2 and 80
     or length(trim(p_email)) not between 5 and 160
     or trim(p_email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or p_phone_last4 !~ '^[0-9]{4}$' then
    raise exception '입력 정보를 확인해 주세요.' using errcode = '22023';
  end if;

  configured_amount := coalesce(
    (select nullif(account->>'amount', '') from public.premium_settings where setting_key = p_product_id),
    '9,900원'
  );
  new_id := 'PYM-' || to_char(current_date, 'MMDD') || '-' || upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 4));

  insert into public.bank_transfer_orders (
    id, product_id, product_title, amount, depositor, email, phone_last4, memo,
    status, created_at, updated_at, client_hash
  ) values (
    new_id, p_product_id, configured_title, configured_amount,
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

revoke all on function public.submit_bank_order(text, text, text, text, text, text) from public, authenticated;
grant execute on function public.submit_bank_order(text, text, text, text, text, text) to anon;
