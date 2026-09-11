-- ============================================================
-- Binder — server-side render infrastructure
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- 0. Profiles + real admin role
--    Admin access used to be a hardcoded password check in the browser's
--    JavaScript — that can never actually protect data, since anyone can read
--    the password straight out of the page source. Real enforcement has to
--    live in Postgres: a signed-in Supabase Auth user, flagged as admin here,
--    checked by every RLS policy below (and in cms-setup.sql).
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  email      text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- security definer: reads profiles.is_admin bypassing RLS, so policies that
-- call is_admin() don't recurse into profiles' own RLS (which itself calls
-- is_admin() to let admins read every profile, not just their own row).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

alter table public.profiles enable row level security;
drop policy if exists "profiles: read own or admin reads all" on public.profiles;
create policy "profiles: read own or admin reads all" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles: update own or admin updates all" on public.profiles;
create policy "profiles: update own or admin updates all" on public.profiles
  for update using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- ---- One-time setup: make yourself an admin ----
-- 1. Supabase dashboard → Authentication → Users → Add user
--    (or sign up normally on the site with the account you want as admin)
-- 2. Run this, with your real email:
--
--    insert into public.profiles (id, email, is_admin)
--    select id, email, true from auth.users where email = 'you@binder.co.in'
--    on conflict (id) do update set is_admin = true;
--
-- 3. Sign in at /admin with that email + password — this replaces the old
--    shared "binder / binder2026" login entirely.

-- 1. Orders table (replaces localStorage for order persistence)
create table if not exists public.orders (
  id              text primary key,                          -- e.g. BDR-3001
  customer_email  text not null,
  customer_name   text,
  customer_id     uuid references auth.users(id) on delete set null,
  title           text not null,
  product         text not null,                            -- photobook | tradebook | artprints | store
  qty             integer not null default 1,
  amount          numeric(10,2) not null,
  status          text not null default 'Received',         -- Received | Printing | Shipped | Delivered | Cancelled
  pay_method      text,
  payment_id      text,
  razorpay_order_id text,
  verified        boolean default false,
  phone           text,
  snapshot        jsonb,                                    -- full design doc + photoMap
  pdf_files       jsonb default '{}',                       -- { cover: 'url', interior: 'url' }
  render_status   text default 'pending',                   -- pending | rendering | done | failed
  render_error    text,
  placed_at       timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orders_customer_idx on public.orders (customer_email, placed_at desc);
create index if not exists orders_status_idx   on public.orders (status);
create index if not exists orders_render_idx   on public.orders (render_status) where render_status = 'pending';

-- Auto-update updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- RLS: customers read/insert their own orders; admins get full access
alter table public.orders enable row level security;

drop policy if exists "customers read own orders" on public.orders;
create policy "customers read own orders" on public.orders
  for select using (auth.uid() is not null and customer_email = (select email from auth.users where id = auth.uid()));

drop policy if exists "admin read all orders" on public.orders;
create policy "admin read all orders" on public.orders
  for select using (public.is_admin());

-- Customers create their own order at checkout (client-side insert, anon key)
drop policy if exists "customers insert own orders" on public.orders;
create policy "customers insert own orders" on public.orders
  for insert with check (auth.uid() is not null and customer_id = auth.uid());

-- Only admins change status, edit designs, or reset render state from the admin panel.
-- (The render-pdf/verify-payment/create-order Edge Functions use the service-role key,
-- which bypasses RLS entirely, so they're unaffected by this and keep working as-is.)
drop policy if exists "service role full access" on public.orders;
drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete orders" on public.orders;
create policy "admin delete orders" on public.orders
  for delete using (public.is_admin());

-- 2. Render jobs table (queue for the worker)
create table if not exists public.render_jobs (
  id          uuid primary key default gen_random_uuid(),
  order_id    text not null references public.orders(id) on delete cascade,
  file_key    text not null,                                -- 'cover' | 'interior' | 'artboard'
  status      text not null default 'queued',              -- queued | processing | done | failed
  attempts    integer not null default 0,
  error       text,
  pdf_url     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists render_jobs_order_idx  on public.render_jobs (order_id);
create index if not exists render_jobs_queued_idx on public.render_jobs (status, created_at) where status = 'queued';

create trigger render_jobs_updated_at
  before update on public.render_jobs
  for each row execute function public.touch_updated_at();

alter table public.render_jobs enable row level security;
-- Only service role accesses render_jobs (no customer RLS needed)

-- Add versioning to orders (run this if the orders table already exists)
alter table public.orders add column if not exists pdf_version integer not null default 1;
alter table public.orders add column if not exists edit_history jsonb default '[]';

-- ============================================================
-- 3. `photos` bucket (customer photo uploads in the book editors)
--    This bucket already exists and works on the live site — these
--    policies are captured here purely so the whole backend is
--    reproducible from this repo if the Supabase project ever needs to
--    be rebuilt. Safe to run even though the bucket already exists.
--    If the bucket itself is missing: Storage → New bucket → name
--    "photos" → toggle Public bucket ON → Create.
--
-- Matches how the app actually uses it (see uploadPhotoToStorage in
-- script.js): only signed-in users upload, and every file is namespaced
-- under a folder named after their own user id — so uploads are
-- restricted to a user writing inside their own folder.
drop policy if exists "photos public read" on storage.objects;
create policy "photos public read"
on storage.objects for select
using (bucket_id = 'photos');

drop policy if exists "photos owner upload" on storage.objects;
create policy "photos owner upload"
on storage.objects for insert
with check (bucket_id = 'photos' and auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos owner update" on storage.objects;
create policy "photos owner update"
on storage.objects for update
using (bucket_id = 'photos' and auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos owner delete" on storage.objects;
create policy "photos owner delete"
on storage.objects for delete
using (bucket_id = 'photos' and auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text);
-- ============================================================

-- ============================================================
-- 4. Raise the per-file upload cap to 100MB
--    script.js (ingestFiles) now accepts individual photo uploads up to
--    100MB client-side, but the "photos" bucket itself has its own,
--    separate file-size ceiling that also has to be raised — otherwise
--    Supabase will reject the upload with a "file too large" error
--    before script.js's own check ever comes into play.
--
--    Run this once in the Supabase SQL Editor (Project → SQL Editor →
--    New query → paste → Run). Safe to re-run any time.
--
--    Also confirm your Supabase plan actually allows 100MB uploads —
--    the Free plan currently caps individual Storage uploads at 50MB
--    regardless of this setting, so a paid plan is required for true
--    100MB files. Check Project Settings → Billing if you hit that wall.
update storage.buckets set file_size_limit = 104857600 -- 100MB, in bytes
where id = 'photos';
-- Optional: raise the same cap on the "cms-images" bucket too, if you also
-- want to upload hero images/videos larger than its current default there.
update storage.buckets set file_size_limit = 104857600
where id = 'cms-images';
-- ============================================================
