-- Apply this after order-mode.sql on an existing Sunnah Cafe database.
-- New orders go directly from accepted to ready; preparing remains only for
-- completing any orders that were already in that legacy state.

create or replace function public.transition_order(
  target_order_id uuid,
  target_status text
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  current_order public.orders;
  previous_status text;
begin
  if not public.is_active_staff('staff') then
    raise exception 'Not authorized';
  end if;

  select * into current_order from public.orders where id = target_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if current_order.status = 'awaiting_staff_approval' and current_order.expires_at <= now() then
    raise exception 'Order approval window has expired';
  end if;
  if not (
    (current_order.status = 'awaiting_staff_approval' and (
      target_status = 'cancelled'
      or (current_order.payment_method = 'sumup_online' and target_status = 'awaiting_payment')
      or (current_order.payment_method <> 'sumup_online' and target_status = 'accepted')
    ))
    or (current_order.status = 'accepted' and target_status in ('ready', 'cancelled'))
    or (current_order.status = 'preparing' and target_status in ('ready', 'cancelled'))
    or (current_order.status = 'ready' and target_status = 'completed')
    or (
      current_order.status = 'awaiting_payment'
      and target_status = 'cancelled'
      and not exists (
        select 1 from public.payment_attempts
        where order_id = current_order.id and status = 'pending'
      )
    )
  ) then
    raise exception 'Invalid order status transition: % -> %', current_order.status, target_status;
  end if;
  if target_status = 'completed' and current_order.payment_status <> 'paid' then
    raise exception 'Order must be paid before completion';
  end if;

  previous_status := current_order.status;
  update public.orders
  set status = target_status,
      payment_status = case
        when target_status = 'awaiting_payment' then 'pending'
        when target_status = 'cancelled' and current_order.status = 'awaiting_payment' then 'failed'
        else payment_status
      end,
      expires_at = case when target_status = 'awaiting_payment' then now() + interval '10 minutes' else expires_at end,
      accepted_at = case when target_status = 'accepted' then now() else accepted_at end,
      completed_at = case when target_status = 'completed' then now() else completed_at end
  where id = target_order_id
  returning * into current_order;

  insert into public.order_events (order_id, event_type, from_status, to_status, actor_id)
  values (target_order_id, 'status_changed', previous_status, target_status, auth.uid());
  return current_order;
end;
$$;