-- Apply after daily-ticket-numbers.sql. Stores customer selections as immutable
-- order snapshots and validates them against the current dish metadata.

alter table public.order_items
  add column if not exists selections jsonb not null default '[]'::jsonb;

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
  dish_record public.dishes;
  cart_item jsonb;
  requested_selection jsonb;
  configured_group jsonb;
  configured_option jsonb;
  requested_selections jsonb;
  option_groups jsonb;
  validated_selections jsonb;
  validated_items jsonb := '[]'::jsonb;
  calculated_total integer := 0;
  item_quantity integer;
  unit_price_cents integer;
  option_price_adjustment_cents integer;
  selection_price_adjustment_cents integer;
  selected_group_count integer;
  dish_id text;
  group_id text;
  option_id text;
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

  for cart_item in select value from jsonb_array_elements(cart_items)
  loop
    dish_id := trim(cart_item ->> 'dishId');
    if dish_id is null or dish_id = '' or coalesce(cart_item ->> 'quantity', '') !~ '^[1-9][0-9]?$' then
      raise exception 'One or more products are unavailable or invalid';
    end if;
    item_quantity := (cart_item ->> 'quantity')::integer;

    select * into dish_record
    from public.dishes
    where id = dish_id and in_stock
    for share;
    if not found then
      raise exception 'One or more products are unavailable or invalid';
    end if;

    requested_selections := coalesce(cart_item -> 'selections', '[]'::jsonb);
    if jsonb_typeof(requested_selections) <> 'array' then
      raise exception 'Invalid product selections';
    end if;
    option_groups := coalesce(dish_record.meta -> 'optionGroups', '[]'::jsonb);
    if jsonb_typeof(option_groups) <> 'array' then
      raise exception 'Invalid product configuration';
    end if;

    for configured_group in select value from jsonb_array_elements(option_groups)
    loop
      group_id := configured_group ->> 'id';
      if group_id is null or group_id = '' then
        raise exception 'Invalid product configuration';
      end if;
      select count(*) into selected_group_count
      from jsonb_array_elements(requested_selections) as selected(value)
      where selected.value ->> 'groupId' = group_id;
      if selected_group_count > 1
         or (coalesce((configured_group ->> 'required')::boolean, false) and selected_group_count <> 1) then
        raise exception 'Required product selection is missing or invalid';
      end if;
    end loop;

    validated_selections := '[]'::jsonb;
    selection_price_adjustment_cents := 0;
    for requested_selection in select value from jsonb_array_elements(requested_selections)
    loop
      group_id := requested_selection ->> 'groupId';
      option_id := requested_selection ->> 'optionId';
      if group_id is null or option_id is null then
        raise exception 'Invalid product selections';
      end if;
      select value into configured_group
      from jsonb_array_elements(option_groups)
      where value ->> 'id' = group_id;
      if not found then
        raise exception 'Invalid product selections';
      end if;
      select value into configured_option
      from jsonb_array_elements(coalesce(configured_group -> 'options', '[]'::jsonb))
      where value ->> 'id' = option_id
        and coalesce((value ->> 'inStock')::boolean, false);
      if not found then
        raise exception 'Selected product option is unavailable';
      end if;
      if coalesce(configured_option ->> 'priceAdjustmentCents', '0') !~ '^[0-9]{1,6}$' then
        raise exception 'Invalid product option price';
      end if;
      option_price_adjustment_cents := coalesce((configured_option ->> 'priceAdjustmentCents')::integer, 0);
      selection_price_adjustment_cents := selection_price_adjustment_cents + option_price_adjustment_cents;
      validated_selections := validated_selections || jsonb_build_array(jsonb_build_object(
        'groupId', group_id,
        'groupLabel', configured_group -> 'label',
        'optionId', option_id,
        'optionLabel', configured_option -> 'label',
        'priceAdjustmentCents', option_price_adjustment_cents
      ));
    end loop;

    unit_price_cents := round(dish_record.price * 100)::integer + selection_price_adjustment_cents;
    calculated_total := calculated_total + unit_price_cents * item_quantity;
    validated_items := validated_items || jsonb_build_array(jsonb_build_object(
      'dishId', dish_record.id,
      'name', dish_record.name,
      'unitPriceCents', unit_price_cents,
      'quantity', item_quantity,
      'selections', validated_selections
    ));
  end loop;

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

  for cart_item in select value from jsonb_array_elements(validated_items)
  loop
    insert into public.order_items (
      order_id, dish_id, name, selections, unit_price_cents, quantity, line_total_cents
    ) values (
      created_order.id,
      cart_item ->> 'dishId',
      cart_item -> 'name',
      cart_item -> 'selections',
      (cart_item ->> 'unitPriceCents')::integer,
      (cart_item ->> 'quantity')::integer,
      (cart_item ->> 'unitPriceCents')::integer * (cart_item ->> 'quantity')::integer
    );
  end loop;

  insert into public.order_events (order_id, event_type, to_status)
  values (created_order.id, 'order_created', created_order.status);

  return created_order;
end;
$$;