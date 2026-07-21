-- Price the lab series independently while preserving the legacy neuro price.

update public.premium_settings
set
  account = coalesce(account, '{}'::jsonb) || jsonb_build_object(
    'amount', '4,900원',
    'saleAmount', '4,900원'
  ),
  updated_at = now()
where setting_key = 'lab-series-6';

create or replace function public.get_public_premium_settings()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'account', coalesce(
      (select account from public.premium_settings where setting_key = 'neuro-series-6'),
      '{}'::jsonb
    ),
    'products', coalesce(
      (
        select jsonb_object_agg(
          setting_key,
          jsonb_build_object('account', account)
        )
        from public.premium_settings
        where setting_key in ('neuro-series-6', 'lab-series-6')
      ),
      '{}'::jsonb
    ),
    'updatedAt', coalesce(
      (select max(updated_at) from public.premium_settings where setting_key in ('neuro-series-6', 'lab-series-6')),
      now()
    )
  );
$$;
