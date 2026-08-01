create or replace function public.mark_manual_sumup_payment_received(
  target_order_id uuid,
  confirmed_amount_cents integer
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  current_order public.orders;
begin
  if not public.is_active_staff('staff') then
    raise exception 'Not authorized';
  end if;

  select * into current_order
  from public.orders
  where id = target_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if current_order.payment_method <> 'sumup_online'
     or current_order.status <> 'awaiting_payment'
     or current_order.payment_status <> 'pending' then
    raise exception 'Order is not waiting for an online payment';
  end if;

  if confirmed_amount_cents <> current_order.total_cents then
    raise exception 'Confirmed payment amount does not match order total';
  end if;

  update public.orders
  set payment_status = 'paid',
      status = 'accepted',
      accepted_at = now()
  where id = target_order_id
  returning * into current_order;

  insert into public.order_events (order_id, event_type, from_status, to_status, actor_id, metadata)
  values (
    target_order_id,
    'manual_sumup_payment_verified',
    'awaiting_payment',
    'accepted',
    auth.uid(),
    jsonb_build_object('confirmedAmountCents', confirmed_amount_cents)
  );

  return current_order;
end;
$$;

revoke all on function public.mark_manual_sumup_payment_received(uuid, integer) from public, anon;
grant execute on function public.mark_manual_sumup_payment_received(uuid, integer) to authenticated;