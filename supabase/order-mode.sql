-- Apply this once to databases where orders.sql has already been run.

create table if not exists public.ordering_settings (
  id          boolean primary key default true check (id),
  mode        text not null default 'approval_required' check (mode in (
    'closed', 'approval_required', 'instant'
  )),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

insert into public.ordering_settings (id, mode)
values (true, 'approval_required')
on conflict (id) do nothing;

do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.orders'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%payment_method = ''sumup_online''%';

  if constraint_name is not null then
    execute format('alter table public.orders drop constraint %I', constraint_name);
  end if;
end;
$$;

alter table public.orders
  add constraint order_status_payment_method_check
  check (payment_method = 'sumup_online' or status <> 'awaiting_payment');

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
  ) then
    raise exception 'Invalid order status transition: % -> %', current_order.status, target_status;
  end if;
  if target_status = 'completed' and current_order.payment_status <> 'paid' then
    raise exception 'Order must be paid before completion';
  end if;

  previous_status := current_order.status;
  update public.orders
  set status = target_status,
      payment_status = case when target_status = 'awaiting_payment' then 'pending' else payment_status end,
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

create or replace function public.set_ordering_mode(target_mode text)
returns public.ordering_settings
language plpgsql
security definer
set search_path = public
as $$
declare settings public.ordering_settings;
begin
  if not public.is_active_staff('staff') then raise exception 'Not authorized'; end if;
  if target_mode not in ('closed', 'approval_required', 'instant') then raise exception 'Invalid ordering mode'; end if;
  update public.ordering_settings set mode = target_mode, updated_at = now(), updated_by = auth.uid()
  where id = true returning * into settings;
  return settings;
end;
$$;

create or replace function public.create_order_from_menu(
  customer_first_name text, fulfillment_location text, customer_note text, payment_method text,
  cart_items jsonb, request_id text, token_hash text
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare created_order public.orders; calculated_total integer; requested_count integer; matched_count integer; ordering_mode text;
begin
  if jsonb_typeof(cart_items) <> 'array' or jsonb_array_length(cart_items) < 1 or jsonb_array_length(cart_items) > 50 then
    raise exception 'Cart must contain between 1 and 50 rows';
  end if;
  select mode into ordering_mode from public.ordering_settings where id = true;
  if ordering_mode is null or ordering_mode = 'closed' then raise exception 'The cafe is not accepting orders right now'; end if;
  select * into created_order from public.orders where idempotency_key = request_id;
  if found then
    if created_order.status_token_hash <> token_hash then raise exception 'Request identifier is already in use'; end if;
    return created_order;
  end if;
  with requested as (
    select item->>'dishId' as dish_id, sum((item->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(cart_items) item group by item->>'dishId'
  ), priced as (
    select requested.dish_id, requested.quantity, dishes.price from requested join public.dishes on dishes.id = requested.dish_id
    where dishes.in_stock and requested.quantity between 1 and 99
  ) select (select count(*) from requested), count(*), coalesce(sum(round(price * 100)::integer * quantity), 0)
    into requested_count, matched_count, calculated_total from priced;
  if requested_count <> matched_count then raise exception 'One or more products are unavailable or invalid'; end if;
  insert into public.orders (status_token_hash, idempotency_key, customer_first_name, fulfillment_location, customer_note, payment_method, payment_status, status, total_cents, expires_at)
  values (
    token_hash, request_id, trim(customer_first_name), fulfillment_location, coalesce(trim(customer_note), ''), payment_method,
    case when ordering_mode = 'instant' and payment_method = 'sumup_online' then 'pending' else 'unpaid' end,
    case when ordering_mode = 'approval_required' then 'awaiting_staff_approval' when payment_method = 'sumup_online' then 'awaiting_payment' else 'accepted' end,
    calculated_total,
    case when ordering_mode = 'approval_required' then now() + interval '10 minutes' when payment_method = 'sumup_online' then now() + interval '10 minutes' else null end
  ) returning * into created_order;
  with requested as (
    select item->>'dishId' as dish_id, sum((item->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(cart_items) item group by item->>'dishId'
  ) insert into public.order_items (order_id, dish_id, name, unit_price_cents, quantity, line_total_cents)
  select created_order.id, dishes.id, dishes.name, round(dishes.price * 100)::integer, requested.quantity, round(dishes.price * 100)::integer * requested.quantity
  from requested join public.dishes on dishes.id = requested.dish_id;
  insert into public.order_events (order_id, event_type, to_status) values (created_order.id, 'order_created', created_order.status);
  return created_order;
end;
$$;

revoke all on function public.set_ordering_mode(text) from public, anon;
grant execute on function public.set_ordering_mode(text) to authenticated;
alter table public.ordering_settings enable row level security;
drop policy if exists "public read ordering settings" on public.ordering_settings;
create policy "public read ordering settings" on public.ordering_settings for select using (true);