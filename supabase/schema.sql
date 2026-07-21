-- Sunnah Cafe — single-tenant menu schema for Supabase (Postgres).
-- Run this in the Supabase dashboard → SQL Editor, or via the Supabase CLI.
--
-- Model: one `dishes` table. Menus are public (anyone can read); only
-- authenticated users (the restaurant admin) may create, update or delete.
-- Security is enforced in the database via Row Level Security — not just in the
-- app — so a leaked anon key still cannot modify the menu.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists public.dishes (
  id                text primary key,
  name              jsonb not null,            -- { EN, FI, SO }
  subtitle          jsonb not null default '{"EN":"","FI":"","SO":""}',
  description       jsonb not null default '{"EN":"","FI":"","SO":""}',
  long_description  jsonb not null default '{"EN":"","FI":"","SO":""}',
  price             numeric(10,2) not null default 0,
  category          text not null,             -- category slug: food, pastry, …
  image_url         text,
  is_popular        boolean not null default false,
  in_stock          boolean not null default true,
  ingredients       jsonb not null default '{"EN":[],"FI":[],"SO":[]}',
  allergens         jsonb not null default '[]',
  meta              jsonb not null default '{}',
  sort_order        int not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists dishes_category_idx on public.dishes (category);
create index if not exists dishes_stock_idx on public.dishes (in_stock);

-- Categories are managed by the restaurant admin and drive customer tabs.
create table if not exists public.categories (
  id          text primary key,
  label       jsonb not null,                  -- { EN, FI, SO }
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists categories_sort_order_idx on public.categories (sort_order);

insert into public.categories (id, label, sort_order) values
  ('food',        '{"EN":"Food","FI":"Ruoka","SO":"Cunto"}', 0),
  ('pastry',      '{"EN":"Pastry","FI":"Leivonnaiset","SO":"Rooti"}', 1),
  ('desserts',    '{"EN":"Desserts","FI":"Jälkiruoat","SO":"Macmacaan"}', 2),
  ('warm-drinks', '{"EN":"Warm Drinks","FI":"Kuumat juomat","SO":"Cabitaan kulul"}', 3),
  ('cold-drinks', '{"EN":"Cold Drinks","FI":"Kylmät juomat","SO":"Cabitaano qabow"}', 4)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.dishes enable row level security;

-- Public read (the menu is public).
drop policy if exists "public read dishes" on public.dishes;
create policy "public read dishes" on public.dishes
  for select using (true);

-- Only authenticated users (the admin) may write.
drop policy if exists "authenticated manage dishes" on public.dishes;
create policy "authenticated manage dishes" on public.dishes
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

alter table public.categories enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select using (true);

drop policy if exists "authenticated manage categories" on public.categories;
create policy "authenticated manage categories" on public.categories
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
