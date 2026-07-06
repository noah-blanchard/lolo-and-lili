-- ============================================================
-- Lolo & Lili — RESET + REINIT (single paste)
-- Drops everything, then rebuilds the full schema, RLS,
-- helper functions, the profile trigger, and realtime.
--
-- ⚠️  DESTRUCTIVE: deletes ALL data in these tables.
-- Safe to run repeatedly. Run in the Supabase SQL editor.
-- ============================================================

-- ------------------------------------------------------------
-- 0. TEARDOWN (CASCADE also drops policies, FKs, indexes and
--    removes tables from the realtime publication)
-- ------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.push_subscriptions cascade;
drop table if exists public.chore_completions cascade;
drop table if exists public.chores cascade;
drop table if exists public.moods cascade;
drop table if exists public.statuses cascade;
drop table if exists public.profiles cascade;
drop table if exists public.couples cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.current_couple_id() cascade;

-- Optional: also wipe accounts for a totally fresh start.
-- Uncomment to use. ⚠️ Everyone must log in again afterwards.
-- delete from auth.users;

-- ------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 2. TABLES
-- ------------------------------------------------------------
create table public.couples (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  invite_code text unique not null default encode(gen_random_bytes(4), 'hex'),
  created_at  timestamptz not null default now()
);

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  couple_id    uuid references public.couples (id) on delete set null,
  display_name text,
  avatar_emoji text default '🐣',
  theme_pref   text default 'system',
  created_at   timestamptz not null default now()
);

create table public.statuses (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  couple_id  uuid not null references public.couples (id) on delete cascade,
  state      text not null default 'free' check (state in ('free', 'busy')),
  emoji      text,
  note       text,
  updated_at timestamptz not null default now()
);

create table public.chores (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples (id) on delete cascade,
  title       text not null,
  assignee_id uuid references public.profiles (id) on delete set null,
  due_date    date,
  recurrence  text not null default 'none'
                check (recurrence in ('none', 'daily', 'weekly', 'monthly')),
  points      int  not null default 0,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table public.chore_completions (
  id              uuid primary key default gen_random_uuid(),
  chore_id        uuid not null references public.chores (id) on delete cascade,
  occurrence_date date not null default current_date,
  completed_by    uuid references public.profiles (id) on delete set null,
  completed_at    timestamptz not null default now(),
  -- Concurrency-safe check-off: simultaneous taps collapse to one row.
  unique (chore_id, occurrence_date)
);

create table public.moods (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  couple_id  uuid not null references public.couples (id) on delete cascade,
  mood       text not null,
  note       text,
  created_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. HELPERS
-- ------------------------------------------------------------

-- Current user's couple. SECURITY DEFINER so it can be used in RLS
-- policies without recursing on the profiles table.
create or replace function public.current_couple_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id from public.profiles where id = auth.uid()
$$;

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;
  return new;
end
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 4. BACKFILL — create profiles for any pre-existing accounts
--    (fixes users who signed up before the trigger existed).
-- ------------------------------------------------------------
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.couples            enable row level security;
alter table public.profiles           enable row level security;
alter table public.statuses           enable row level security;
alter table public.chores             enable row level security;
alter table public.chore_completions  enable row level security;
alter table public.moods              enable row level security;
alter table public.push_subscriptions enable row level security;

-- couples: members read/update; any authed user can create one.
create policy couples_select on public.couples
  for select using (id = public.current_couple_id());
create policy couples_insert on public.couples
  for insert with check (auth.uid() is not null);
create policy couples_update on public.couples
  for update using (id = public.current_couple_id());

-- profiles: see yourself and your partner; only edit yourself.
create policy profiles_select on public.profiles
  for select using (
    id = auth.uid() or couple_id = public.current_couple_id()
  );
create policy profiles_insert on public.profiles
  for insert with check (id = auth.uid());
create policy profiles_update on public.profiles
  for update using (id = auth.uid());

-- statuses / chores / moods: scoped to the couple.
create policy statuses_all on public.statuses
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

create policy chores_all on public.chores
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

create policy moods_all on public.moods
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

-- chore_completions: scoped via the parent chore's couple.
create policy chore_completions_all on public.chore_completions
  for all using (
    exists (
      select 1 from public.chores c
      where c.id = chore_id and c.couple_id = public.current_couple_id()
    )
  )
  with check (
    exists (
      select 1 from public.chores c
      where c.id = chore_id and c.couple_id = public.current_couple_id()
    )
  );

-- push_subscriptions: only your own.
create policy push_subscriptions_all on public.push_subscriptions
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ------------------------------------------------------------
-- 6. REALTIME — broadcast row changes for these tables.
--    Guarded so re-running never errors on duplicates.
-- ------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.statuses;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.chores;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.chore_completions;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.moods;
exception when duplicate_object then null;
end $$;
