-- Lolo & Lili — web push notifications.
-- Adds per-user category preferences (shared across a user's devices) and a
-- per-device locale so pushes can be localized server-side.
-- Run in the Supabase SQL editor (or via `supabase db push`), then regenerate
-- types with `bun run gen:types`.

-- Per-category opt-outs. The master on/off is the device subscription itself;
-- these flags let a user mute individual categories across all their devices.
alter table public.profiles
  add column if not exists notification_prefs jsonb not null
  default '{"chores":true,"moods":true,"status":true,"pet":true}'::jsonb;

-- Remember each device's UI locale so the send path can pick fr/zh copy.
alter table public.push_subscriptions
  add column if not exists locale text not null default 'fr';

-- RLS needs no change: profiles_* (own row) and push_subscriptions_all
-- (user_id = auth.uid()) already cover reads/writes. The send path uses the
-- service-role client, which bypasses RLS to read the partner's rows.
