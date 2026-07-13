-- Zahiiba — single-tenant menu schema for Supabase (Postgres).
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
