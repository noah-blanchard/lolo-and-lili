-- Lolo & Lili — shared expenses (50/50 split) with a settle-up ledger.
-- Amounts stored in integer cents to avoid float drift. Run in the Supabase SQL
-- editor (or `supabase db push`), then `bun run gen:types`.

create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid not null references public.couples (id) on delete cascade,
  payer_id     uuid references public.profiles (id) on delete set null,
  amount_cents int  not null check (amount_cents > 0),
  currency     text not null default 'EUR',
  description  text not null check (char_length(description) between 1 and 120),
  created_at   timestamptz not null default now()
);

create table if not exists public.expense_settlements (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid not null references public.couples (id) on delete cascade,
  from_id      uuid references public.profiles (id) on delete set null,
  to_id        uuid references public.profiles (id) on delete set null,
  amount_cents int  not null check (amount_cents > 0),
  created_at   timestamptz not null default now()
);

create index if not exists expenses_couple_created_idx
  on public.expenses (couple_id, created_at desc);

alter table public.expenses            enable row level security;
alter table public.expense_settlements enable row level security;

create policy expenses_all on public.expenses
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

create policy expense_settlements_all on public.expense_settlements
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.expense_settlements;
