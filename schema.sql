-- SadRed database schema. Run this in Supabase SQL Editor.
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null default '',
  category text not null default 'Andere',
  city text not null,
  reward_eur numeric(10,2) not null default 0 check (reward_eur >= 0),
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

drop policy if exists "Anyone can view listings" on public.listings;
create policy "Anyone can view listings"
on public.listings for select using (true);

drop policy if exists "Authenticated users can create listings" on public.listings;
create policy "Authenticated users can create listings"
on public.listings for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Owners can update listings" on public.listings;
create policy "Owners can update listings"
on public.listings for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Owners can delete listings" on public.listings;
create policy "Owners can delete listings"
on public.listings for delete to authenticated
using (auth.uid() = user_id);

create index if not exists listings_created_at_idx on public.listings(created_at desc);
create index if not exists listings_city_idx on public.listings(city);
