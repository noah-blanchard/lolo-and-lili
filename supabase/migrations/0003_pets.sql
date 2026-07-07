-- Lolo & Lili — shared virtual pet ("our cat"), a co-op tamagotchi.
-- One cat per couple. Wellbeing decays over time (computed on read from
-- meters_at); both partners care for it. Run in the Supabase SQL editor
-- (or `supabase db push`), then regenerate types with `bun run gen:types`.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.pets (
  id             uuid primary key default gen_random_uuid(),
  couple_id      uuid not null unique references public.couples (id) on delete cascade,
  name           text not null,
  skin           text not null default 'classic',
  stage          int  not null default 1,
  level          int  not null default 1,
  xp             int  not null default 0,
  streak_count   int  not null default 0,
  streak_last_day date,
  -- Wellbeing meters (0-100), decayed on read from meters_at.
  hunger         int  not null default 80,
  affection      int  not null default 80,
  energy         int  not null default 80,
  cleanliness    int  not null default 80,
  meters_at      timestamptz not null default now(),
  -- Set when neglected past the run-away threshold; cleared on a co-op call-back.
  ran_away_at    timestamptz,
  -- Currency wallet (earned from chores).
  treats         int  not null default 0,
  equipped       jsonb not null default '{}'::jsonb,
  unlocked       jsonb not null default '[]'::jsonb,
  created_by     uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now()
);

create table if not exists public.pet_actions (
  id            uuid primary key default gen_random_uuid(),
  couple_id     uuid not null references public.couples (id) on delete cascade,
  pet_id        uuid not null references public.pets (id) on delete cascade,
  type          text not null
                  check (type in ('feed','pet','play','groom','heal','gift','cuddle','callback')),
  performed_by  uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);

create table if not exists public.pet_memories (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples (id) on delete cascade,
  pet_id      uuid not null references public.pets (id) on delete cascade,
  kind        text not null,
  title       text not null,
  emoji       text not null default '✨',
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists pet_actions_pet_created_idx
  on public.pet_actions (pet_id, created_at desc);
create index if not exists pet_memories_couple_created_idx
  on public.pet_memories (couple_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS — everything scoped to the caller's couple (mirrors chores_all)
-- ---------------------------------------------------------------------------

alter table public.pets         enable row level security;
alter table public.pet_actions  enable row level security;
alter table public.pet_memories enable row level security;

create policy pets_all on public.pets
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

create policy pet_actions_all on public.pet_actions
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

create policy pet_memories_all on public.pet_memories
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

-- ---------------------------------------------------------------------------
-- Realtime — broadcast pet changes to the couple's channel
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.pets;
alter publication supabase_realtime add table public.pet_actions;
alter publication supabase_realtime add table public.pet_memories;
