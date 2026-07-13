-- Zahiiba — Storage bucket for menu images.
-- Run in Supabase dashboard → SQL Editor after schema.sql.

-- Public bucket so <img src> works without signed URLs.
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

-- Anyone can view images.
drop policy if exists "public read menu images" on storage.objects;
create policy "public read menu images" on storage.objects
  for select using (bucket_id = 'menu-images');

-- Only authenticated users (the admin) may upload / change / delete images.
drop policy if exists "authenticated write menu images" on storage.objects;
create policy "authenticated write menu images" on storage.objects
  for all
  using (bucket_id = 'menu-images' and auth.uid() is not null)
  with check (bucket_id = 'menu-images' and auth.uid() is not null);
