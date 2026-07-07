-- Lolo & Lili — question of the day. Both partners answer the same daily prompt
-- privately; the app reveals both answers once both have replied. Run in the
-- Supabase SQL editor (or `supabase db push`), then `bun run gen:types`.

create table if not exists public.question_answers (
  id            uuid primary key default gen_random_uuid(),
  couple_id     uuid not null references public.couples (id) on delete cascade,
  question_date date not null default current_date,
  question_key  text not null,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  answer        text not null check (char_length(answer) between 1 and 500),
  created_at    timestamptz not null default now(),
  unique (couple_id, question_date, user_id)
);

create index if not exists question_answers_couple_date_idx
  on public.question_answers (couple_id, question_date);

alter table public.question_answers enable row level security;

create policy question_answers_all on public.question_answers
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

alter publication supabase_realtime add table public.question_answers;
