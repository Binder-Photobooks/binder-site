-- ============================================================
-- Binder CMS — persistent content table
-- Run this in Supabase SQL Editor
-- IMPORTANT: run supabase-setup.sql FIRST — it creates the
-- public.profiles table and the is_admin() function these
-- policies depend on.
-- ============================================================

-- Single table: key → json value, editable only by admins
-- Public can read (for loading site content), only admins can write
create table if not exists public.cms (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Auto-update timestamp
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists cms_updated_at on public.cms;
create trigger cms_updated_at
  before update on public.cms
  for each row execute function public.touch_updated_at();

-- RLS: anyone can read (site content is public); only a signed-in admin can write
alter table public.cms enable row level security;

drop policy if exists "public read cms" on public.cms;
create policy "public read cms" on public.cms
  for select using (true);

drop policy if exists "admin write cms" on public.cms;
create policy "admin write cms" on public.cms
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Also create the cms-images storage bucket (needed for Store
-- product photo uploads in Admin → Products):
--   Supabase dashboard → Storage → New bucket
--   Name: cms-images
--   Toggle "Public bucket" ON
--   Create
-- Without this bucket, uploading a product image in the admin
-- panel will fail with a toast telling you it's missing.
--
-- IMPORTANT: "Public bucket" only controls READ access (anyone
-- can view/download the files). It does NOT allow uploads —
-- Storage has its own Row-Level Security on storage.objects,
-- and by default it blocks everything. Run this too:

drop policy if exists "cms-images public read" on storage.objects;
create policy "cms-images public read"
on storage.objects for select
using (bucket_id = 'cms-images');

-- Uploads/edits/deletes require a signed-in admin (public.is_admin()),
-- enforced by Postgres itself — not just the admin panel's login screen.
drop policy if exists "cms-images admin upload" on storage.objects;
create policy "cms-images admin upload"
on storage.objects for insert
with check (bucket_id = 'cms-images' and public.is_admin());

drop policy if exists "cms-images admin update" on storage.objects;
create policy "cms-images admin update"
on storage.objects for update
using (bucket_id = 'cms-images' and public.is_admin());

drop policy if exists "cms-images admin delete" on storage.objects;
create policy "cms-images admin delete"
on storage.objects for delete
using (bucket_id = 'cms-images' and public.is_admin());
-- ============================================================
