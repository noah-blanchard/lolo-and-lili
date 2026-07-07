-- Lolo & Lili — profile customization.
-- Adds a per-person accent color, gives new accounts a random avatar + accent,
-- and broadcasts profile changes so a partner's edits sync live.
-- Run in the Supabase SQL editor (or via `supabase db push`), then regenerate
-- types with `bun run gen:types`.

alter table public.profiles
  add column if not exists accent_color text;

-- New accounts get a random avatar emoji + accent so they never start blank.
-- The arrays mirror AVATAR_EMOJIS / ACCENTS in src/lib/avatars.ts — keep in sync.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  emojis  text[] := array['🐣','🐥','🐨','🐸','🦊','🐰','🐻','🐼','🐧','🐙','🦄','🐝','🌸','🌷','🌟','🍑','🍓','💫'];
  accents text[] := array['coral','mint','sky','lavender','peach','lemon','bubblegum','sage'];
begin
  insert into public.profiles (id, display_name, avatar_emoji, accent_color)
  values (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    emojis[floor(random() * array_length(emojis, 1)) + 1],
    accents[floor(random() * array_length(accents, 1)) + 1]
  )
  on conflict (id) do nothing;
  return new;
end
$$;

-- Live partner sync: broadcast profile row changes to the couple's realtime channel.
alter publication supabase_realtime add table public.profiles;
