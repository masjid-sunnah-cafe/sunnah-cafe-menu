-- Apply this after simplify-order-flow.sql on an existing Sunnah Cafe database.
-- Expire staff approvals and unpaid online orders once their expiry time passes.

create or replace function public.expire_unapproved_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_count integer;
begin
  with expired as (
    update public.orders
    set status = 'expired'
    where status in ('awaiting_staff_approval', 'awaiting_payment')
      and expires_at <= now()
    returning id
  )
  select count(*) into expired_count from expired;

  return expired_count;
end;
$$;

create extension if not exists pg_cron with schema extensions;
select cron.unschedule(jobid) from cron.job where jobname = 'expire-sunnah-cafe-orders';
select cron.schedule('expire-sunnah-cafe-orders', '* * * * *', $$select public.expire_unapproved_orders();$$);