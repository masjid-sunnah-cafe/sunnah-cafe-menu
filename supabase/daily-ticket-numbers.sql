-- Apply after the existing Sunnah Cafe order migrations.
-- Keeps order_number as the permanent audit ID while adding short daily pickup numbers.

alter table public.orders
  add column if not exists ticket_date date,
  add column if not exists ticket_number integer;

with numbered_orders as (
  select
    id,
    (created_at at time zone 'Europe/Helsinki')::date as assigned_ticket_date,
    row_number() over (
      partition by (created_at at time zone 'Europe/Helsinki')::date
      order by created_at, order_number
    )::integer as assigned_ticket_number
  from public.orders
)
update public.orders as orders
set ticket_date = numbered_orders.assigned_ticket_date,
    ticket_number = numbered_orders.assigned_ticket_number
from numbered_orders
where orders.id = numbered_orders.id
  and (orders.ticket_date is null or orders.ticket_number is null);

alter table public.orders
  alter column ticket_date set default ((now() at time zone 'Europe/Helsinki')::date),
  alter column ticket_date set not null,
  alter column ticket_number set not null;

alter table public.orders
  drop constraint if exists orders_ticket_number_check,
  add constraint orders_ticket_number_check check (ticket_number between 1 and 999),
  drop constraint if exists orders_ticket_number_unique,
  add constraint orders_ticket_number_unique unique (ticket_date, ticket_number);

create table if not exists public.order_ticket_counters (
  ticket_date         date primary key,
  last_ticket_number  integer not null check (last_ticket_number between 0 and 999)
);

insert into public.order_ticket_counters (ticket_date, last_ticket_number)
select ticket_date, max(ticket_number)
from public.orders
group by ticket_date
on conflict (ticket_date) do update
set last_ticket_number = greatest(
  public.order_ticket_counters.last_ticket_number,
  excluded.last_ticket_number
);

create index if not exists orders_ticket_idx
  on public.orders (ticket_date desc, ticket_number desc);

create or replace function public.create_order_from_menu(
  customer_first_name text,
  fulfillment_location text,
  customer_note text,
  payment_method text,
  cart_items jsonb,
  request_id text,
  token_hash text
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  created_order public.orders;
  calculated_total integer;
  requested_count integer;
  matched_count integer;
  ordering_mode text;
  current_ticket_date date := (now() at time zone 'Europe/Helsinki')::date;
  next_ticket_number integer;
begin
  if jsonb_typeof(cart_items) <> 'array'
     or jsonb_array_length(cart_items) < 1
     or jsonb_array_length(cart_items) > 50 then
    raise exception 'Cart must contain between 1 and 50 rows';
  end if;

  select mode into ordering_mode
  from public.ordering_settings
  where id = true;

  if ordering_mode is null or ordering_mode = 'closed' then
    raise exception 'The cafe is not accepting orders right now';
  end if;

  select * into created_order
  from public.orders
  where idempotency_key = request_id;

  if found then
    if created_order.status_token_hash <> token_hash then
      raise exception 'Request identifier is already in use';
    end if;
    return created_order;
  end if;

  with requested as (
    select item->>'dishId' as dish_id, sum((item->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(cart_items) item
    group by item->>'dishId'
  ), priced as (
    select requested.dish_id, requested.quantity, dishes.price
    from requested
    join public.dishes on dishes.id = requested.dish_id
    where dishes.in_stock and requested.quantity between 1 and 99
  )
  select (select count(*) from requested), count(*),
    coalesce(sum(round(price * 100)::integer * quantity), 0)
  into requested_count, matched_count, calculated_total
  from priced;

  if requested_count <> matched_count then
    raise exception 'One or more products are unavailable or invalid';
  end if;

  insert into public.order_ticket_counters (ticket_date, last_ticket_number)
  values (current_ticket_date, 1)
  on conflict (ticket_date) do update
  set last_ticket_number = public.order_ticket_counters.last_ticket_number + 1
  returning last_ticket_number into next_ticket_number;

  if next_ticket_number > 999 then
    raise exception 'Daily ticket number limit reached';
  end if;

  insert into public.orders (
    status_token_hash, idempotency_key, ticket_date, ticket_number,
    customer_first_name, fulfillment_location, customer_note, payment_method,
    payment_status, status, total_cents, expires_at
  ) values (
    token_hash, request_id, current_ticket_date, next_ticket_number,
    trim(customer_first_name), fulfillment_location, coalesce(trim(customer_note), ''), payment_method,
    'unpaid', 'awaiting_staff_approval', calculated_total, now() + interval '10 minutes'
  )
  returning * into created_order;

  with requested as (
    select item->>'dishId' as dish_id, sum((item->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(cart_items) item
    group by item->>'dishId'
  )
  insert into public.order_items (
    order_id, dish_id, name, unit_price_cents, quantity, line_total_cents
  )
  select
    created_order.id, dishes.id, dishes.name, round(dishes.price * 100)::integer,
    requested.quantity, round(dishes.price * 100)::integer * requested.quantity
  from requested
  join public.dishes on dishes.id = requested.dish_id;

  insert into public.order_events (order_id, event_type, to_status)
  values (created_order.id, 'order_created', created_order.status);

  return created_order;
end;
$$;