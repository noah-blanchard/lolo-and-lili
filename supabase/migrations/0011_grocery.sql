-- Lolo & Lili — shared grocery list. Run in the Supabase SQL editor (or
-- `supabase db push`), then `bun run gen:types`.

create table if not exists public.grocery_items (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 120),
  quantity   text,
  checked    boolean not null default false,
  checked_by uuid references public.profiles (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists grocery_items_couple_created_idx
  on public.grocery_items (couple_id, created_at desc);

alter table public.grocery_items enable row level security;

create policy grocery_items_all on public.grocery_items
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

alter publication supabase_realtime add table public.grocery_items;
