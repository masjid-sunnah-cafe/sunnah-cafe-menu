-- Apply this after the existing Sunnah Cafe order migrations.
-- All orders now require staff approval; the old instant-order mode is removed.

do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.ordering_settings'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%instant%';

  if constraint_name is not null then
    execute format('alter table public.ordering_settings drop constraint %I', constraint_name);
  end if;
end;
$$;

alter table public.ordering_settings
  add constraint ordering_settings_mode_check
  check (mode in ('closed', 'approval_required'));

update public.ordering_settings
set mode = 'approval_required', updated_at = now()
where mode = 'instant';

create or replace function public.set_ordering_mode(target_mode text)
returns public.ordering_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  settings public.ordering_settings;
begin
  if not public.is_active_staff('staff') then raise exception 'Not authorized'; end if;
  if target_mode not in ('closed', 'approval_required') then raise exception 'Invalid ordering mode'; end if;

  update public.ordering_settings
  set mode = target_mode, updated_at = now(), updated_by = auth.uid()
  where id = true
  returning * into settings;
  return settings;
end;
$$;