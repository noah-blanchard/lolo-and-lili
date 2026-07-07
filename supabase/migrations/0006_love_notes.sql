-- Lolo & Lili — love notes: a little wall of sweet messages between partners.
-- Ephemeral hearts/typing ride a Broadcast channel (no DB). Run in the Supabase
-- SQL editor (or `supabase db push`), then `bun run gen:types`.

create table if not exists public.love_notes (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples (id) on delete cascade,
  author_id  uuid references public.profiles (id) on delete set null,
  body       text not null check (char_length(body) between 1 and 280),
  accent     text,
  created_at timestamptz not null default now()
);

create index if not exists love_notes_couple_created_idx
  on public.love_notes (couple_id, created_at desc);

alter table public.love_notes enable row level security;

create policy love_notes_all on public.love_notes
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

alter publication supabase_realtime add table public.love_notes;
