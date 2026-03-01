-- =========================
-- UPDATE USERS TABLE
-- Add new personal info columns
-- Run this in Supabase SQL Editor
-- =========================

alter table public.users
add column if not exists mobile text,
add column if not exists dob date,
add column if not exists address text,
add column if not exists institution text,
add column if not exists degree text;

-- =========================
-- CREATE FIELD OF INTEREST TABLE
-- =========================

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  interest_name text not null,
  created_at timestamp with time zone default now()
);

alter table public.interests enable row level security;

-- Drop policy if it exists then recreate (safe re-run)
drop policy if exists "Users manage their interests" on public.interests;

create policy "Users manage their interests"
on public.interests
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================
-- ENABLE REALTIME ON TABLES
-- Required for live dashboard updates
-- Run this in Supabase SQL Editor
-- Safe: skips tables already in the publication
-- =========================

do $$
declare
  tables text[] := array['gigs','users','applications','notifications','solutions'];
  t text;
begin
  foreach t in array tables loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Verify which tables are now in the publication:
-- SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
