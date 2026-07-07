-- Lolo & Lili — special dates & countdowns (anniversaries, birthdays, custom).
-- Recurring dates repeat every year. Run in the Supabase SQL editor (or
-- `supabase db push`), then `bun run gen:types`.

create table if not exists public.special_dates (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 60),
  date       date not null,
  kind       text not null default 'custom' check (kind in ('anniversary','birthday','custom')),
  recurring  boolean not null default true,
  emoji      text not null default '🎉',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists special_dates_couple_idx
  on public.special_dates (couple_id);

alter table public.special_dates enable row level security;

create policy special_dates_all on public.special_dates
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

alter publication supabase_realtime add table public.special_dates;
