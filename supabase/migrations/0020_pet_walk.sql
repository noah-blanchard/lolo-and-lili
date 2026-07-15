-- Lolo & Lili — "take the dog out" walk feature.
-- Adds the rising `bladder` meter (high is bad; a walk resets it) and the
-- `walk` care action. Reuses `meters_at` as the rise anchor (no new timestamp).
-- Run in the Supabase SQL editor (or `supabase db push`), then regenerate
-- types with `bun run gen:types`.

alter table public.pets
  add column if not exists bladder int not null default 0;

-- Allow the new 'walk' action type.
alter table public.pet_actions
  drop constraint if exists pet_actions_type_check;
alter table public.pet_actions
  add constraint pet_actions_type_check
  check (type in ('feed','pet','play','groom','heal','gift','cuddle','callback','walk'));
