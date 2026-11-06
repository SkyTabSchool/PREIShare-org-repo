-- Sponsor profiles and property_listings RLS.
-- Follows docs/data-model-and-rls-matrix.md.
-- profiles.id and property_listings.owner_id both reference auth.users(id).
-- Policies compare those columns to auth.uid(). No policy for anon.
-- No DELETE policy on profiles. Listing policies already exist in
-- 20250321000000_property_listings.sql; drop-if-exists lets this file reapply them.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.property_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  address_line1 text not null,
  city text not null,
  region text,
  postal_code text,
  country text not null default 'US',
  price numeric(12, 2) not null check (price >= 0),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists property_listings_owner_id_idx
  on public.property_listings (owner_id);

create index if not exists property_listings_status_idx
  on public.property_listings (status);

alter table public.profiles enable row level security;
alter table public.property_listings enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- profiles DELETE: no policy (denied this sprint).

drop policy if exists "listings_select_own" on public.property_listings;
create policy "listings_select_own"
  on public.property_listings
  for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "listings_insert_own" on public.property_listings;
create policy "listings_insert_own"
  on public.property_listings
  for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "listings_update_own" on public.property_listings;
create policy "listings_update_own"
  on public.property_listings
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "listings_delete_own" on public.property_listings;
create policy "listings_delete_own"
  on public.property_listings
  for delete
  to authenticated
  using (owner_id = auth.uid());

-- anon: no policy on profiles or property_listings.
