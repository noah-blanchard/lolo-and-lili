-- Lolo & Lili — add opened_at to love notes for open/close/archive state.
-- Shared state: once one partner opens a note, opened_at is set for both.

alter table public.love_notes
  add column if not exists opened_at timestamptz;

create index if not exists love_notes_couple_opened_idx
  on public.love_notes (couple_id, opened_at);
