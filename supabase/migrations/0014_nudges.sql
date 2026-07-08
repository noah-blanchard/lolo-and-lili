-- Lolo & Lili — quick affection "nudges". One-tap pings a partner sends from the
-- home screen ("I miss you", "I love you", …). Rows drive the per-kind cooldown
-- and let the partner see an in-app toast (a push fires too). Run in the Supabase
-- SQL editor (or `supabase db push`), then regenerate types with `bun run gen:types`.

create table if not exists public.nudges (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples (id) on delete cascade,
  from_user   uuid references public.profiles (id) on delete set null,
  kind        text not null
                check (kind in ('miss','love','think','kiss','hug')),
  created_at  timestamptz not null default now()
);

create index if not exists nudges_couple_created_idx
  on public.nudges (couple_id, created_at desc);

-- RLS — scoped to the caller's couple (mirrors pets/love_notes)
alter table public.nudges enable row level security;

create policy nudges_all on public.nudges
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

-- Realtime — broadcast nudges to the couple's channel
alter publication supabase_realtime add table public.nudges;
