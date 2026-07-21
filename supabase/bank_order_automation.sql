-- Sends every new bank-transfer order to the Vercel automation endpoint.
-- The shared secret must exist in Supabase Vault as bank_order_automation_secret.

create extension if not exists pg_net with schema extensions;

create or replace function private.notify_bank_order_automation()
returns trigger
language plpgsql
security definer
set search_path = private, vault, net, pg_temp
as $$
declare
  automation_secret text;
begin
  select decrypted_secret
    into automation_secret
  from vault.decrypted_secrets
  where name = 'bank_order_automation_secret';

  if automation_secret is null then
    raise warning 'bank_order_automation_secret is not configured';
    return new;
  end if;

  perform net.http_post(
    url := 'https://park-yongmin-search.vercel.app/api/bank-order-automation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-automation-secret', automation_secret
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', tg_table_name,
      'schema', tg_table_schema,
      'record', to_jsonb(new),
      'old_record', null
    ),
    timeout_milliseconds := 5000
  );

  return new;
end;
$$;

revoke all on function private.notify_bank_order_automation()
  from public, anon, authenticated;

drop trigger if exists bank_order_automation_webhook
  on public.bank_transfer_orders;

create trigger bank_order_automation_webhook
after insert on public.bank_transfer_orders
for each row execute function private.notify_bank_order_automation();
