-- Lolo & Lili — expand notification categories for the P3+ feature wave.
-- Adds love / dates / home categories alongside chores/moods/status/pet.
-- Run in the Supabase SQL editor (or `supabase db push`), then `bun run gen:types`.

-- New default for freshly-created profiles.
alter table public.profiles
  alter column notification_prefs
  set default '{"chores":true,"moods":true,"status":true,"pet":true,"love":true,"dates":true,"home":true}'::jsonb;

-- Backfill existing rows: add the new keys without clobbering existing choices.
update public.profiles
set notification_prefs =
  '{"love":true,"dates":true,"home":true}'::jsonb || coalesce(notification_prefs, '{}'::jsonb);
