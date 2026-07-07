-- Lolo & Lili — weekly meal planner. One meal per couple/date/slot. Run in the
-- Supabase SQL editor (or `supabase db push`), then `bun run gen:types`.

create table if not exists public.meals (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples (id) on delete cascade,
  date       date not null,
  slot       text not null check (slot in ('breakfast','lunch','dinner')),
  title      text not null check (char_length(title) between 1 and 120),
  cook_id    uuid references public.profiles (id) on delete set null,
  notes      text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (couple_id, date, slot)
);

create index if not exists meals_couple_date_idx on public.meals (couple_id, date);

alter table public.meals enable row level security;

create policy meals_all on public.meals
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

alter publication supabase_realtime add table public.meals;
