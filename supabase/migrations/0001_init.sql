-- Lolo & Lili — initial schema, RLS, triggers, realtime.
-- Run in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.couples (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  invite_code text unique not null default encode(gen_random_bytes(4), 'hex'),
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  couple_id    uuid references public.couples (id) on delete set null,
  display_name text,
  avatar_emoji text default '🐣',
  theme_pref   text default 'peach',
  created_at   timestamptz not null default now()
);

create table if not exists public.statuses (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  couple_id  uuid not null references public.couples (id) on delete cascade,
  state      text not null default 'free' check (state in ('free', 'busy')),
  emoji      text,
  note       text,
  updated_at timestamptz not null default now()
);

create table if not exists public.chores (
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

create table if not exists public.chore_completions (
  id              uuid primary key default gen_random_uuid(),
  chore_id        uuid not null references public.chores (id) on delete cascade,
  occurrence_date date not null default current_date,
  completed_by    uuid references public.profiles (id) on delete set null,
  completed_at    timestamptz not null default now(),
  -- Concurrency-safe check-off: two simultaneous taps collapse to one row.
  unique (chore_id, occurrence_date)
);

create table if not exists public.moods (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  couple_id  uuid not null references public.couples (id) on delete cascade,
  mood       text not null,
  note       text,
  created_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Current user's couple. SECURITY DEFINER so it can be used inside RLS
-- policies without causing recursion on the profiles table.
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.couples            enable row level security;
alter table public.profiles           enable row level security;
alter table public.statuses           enable row level security;
alter table public.chores             enable row level security;
alter table public.chore_completions  enable row level security;
alter table public.moods              enable row level security;
alter table public.push_subscriptions enable row level security;

-- couples: members can read/update; any authed user can create one.
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

-- ---------------------------------------------------------------------------
-- Realtime — broadcast row changes for these tables.
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.statuses;
alter publication supabase_realtime add table public.chores;
alter publication supabase_realtime add table public.chore_completions;
alter publication supabase_realtime add table public.moods;
