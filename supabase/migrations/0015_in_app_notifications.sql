-- In-app notification center. One row per recipient per partner event.
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  actor_id    uuid references auth.users (id) on delete set null,
  key         text not null,                       -- NotifyKey (chore_done, love_note, ...)
  category    text not null,                       -- NotifyCategory (chores, love, ...)
  title       text not null,
  body        text not null,
  target      text not null,                        -- locale-agnostic route, e.g. "/notes"
  target_id   text,                                 -- optional resource id for deep-linking
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

-- Fast unread count (partial index).
create index if not exists notifications_unread_idx
  on public.notifications (recipient_id)
  where not read;

alter table public.notifications enable row level security;

-- Recipients see only their own rows (couple-scoped via recipient_id = auth.uid()).
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select using (recipient_id = auth.uid());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

drop policy if exists notifications_delete on public.notifications;
create policy notifications_delete on public.notifications
  for delete using (recipient_id = auth.uid());

-- Inserts happen via the service-role (admin) client, which bypasses RLS.
-- Allow couple members too so no RLS gap exists if we ever insert under the
-- RLS client.
drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert with check (
    couple_id in (select couple_id from public.profiles where id = auth.uid())
  );
