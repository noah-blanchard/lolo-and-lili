-- ============================================================
-- Lolo & Lili — FULL DATABASE RESET
-- Drops every object created by 0001_init.sql so it can be
-- re-run from scratch.
--
-- ⚠️  DESTRUCTIVE & IRREVERSIBLE: deletes ALL data in these
--     tables. Run in the Supabase SQL editor, then re-run
--     supabase/migrations/0001_init.sql to recreate everything.
-- ============================================================

-- 1. Trigger on auth.users (drop before the function it calls).
drop trigger if exists on_auth_user_created on auth.users;

-- 2. Tables. CASCADE also drops their RLS policies, foreign keys,
--    indexes, and removes them from the realtime publication.
drop table if exists public.push_subscriptions cascade;
drop table if exists public.chore_completions cascade;
drop table if exists public.chores cascade;
drop table if exists public.moods cascade;
drop table if exists public.statuses cascade;
drop table if exists public.profiles cascade;
drop table if exists public.couples cascade;

-- 3. Helper functions.
drop function if exists public.handle_new_user() cascade;
drop function if exists public.current_couple_id() cascade;

-- ------------------------------------------------------------
-- OPTIONAL — also wipe all auth users, so the next login starts
-- completely fresh and profiles are recreated by the trigger.
-- Uncomment to use. ⚠️ Everyone must log in again afterwards.
-- ------------------------------------------------------------
-- delete from auth.users;
