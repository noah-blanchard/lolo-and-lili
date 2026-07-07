-- Lolo & Lili — shared bucket list / date jar: things to do together.
-- Run in the Supabase SQL editor (or `supabase db push`), then `bun run gen:types`.

create table if not exists public.bucket_items (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 120),
  note       text,
  done       boolean not null default false,
  done_by    uuid references public.profiles (id) on delete set null,
  done_at    timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists bucket_items_couple_created_idx
  on public.bucket_items (couple_id, created_at desc);

alter table public.bucket_items enable row level security;

create policy bucket_items_all on public.bucket_items
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

alter publication supabase_realtime add table public.bucket_items;
