# Plan — In-App Notification Panel

## 1. Goal

The PWA already sends **Web Push** notifications (`lib/notifications/*`) but they vanish
after the OS toast. We add an **in-app notification center**: a bell in the app shell that
opens a bottom-sheet panel listing every notification, with an unread badge, a "mark all
read" action, and a **"Go to"** button that deep-links to the originating feature (e.g. a
partner's love note → `/notes`).

Everything follows the repo contract: `defineRoute` + zod, couple-scoped RLS, centralized
`queryKeys`, Realtime reconciliation, atomic/dumb UI components, `next-intl` copy, `@/*`
imports, `cn()`, `motion/react`, and the cute color theme.

---

## 2. Data model — new migration

**File:** `supabase/migrations/0015_in_app_notifications.sql`

A new `notifications` table. Each row is addressed to **one recipient** (the person who
should see it) and is created when a partner triggers a notify event. The push payload
(`url`, `title`, `body`) is reused to populate the row, so the in-app entry and the push
match exactly.

```sql
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
```

Then ask the user to regenerate types: `bun run gen:types` (updates `Database` / `Notification` in
`src/lib/supabase/database.types.ts`, re-exported from `@/lib/supabase/types`). before proceeding with the rest.

---

## 3. Server layer

### 3.1 Schema — `src/lib/schemas/notification.ts`

```ts
import { z } from "zod";
import { NOTIFY_CATEGORIES } from "./push";

export const NOTIFY_KEYS = [ /* the 21 NotifyKey literals */ ] as const;
export type NotifyKey = (typeof NOTIFY_KEYS)[number];

export const notificationSchema = z.object({
  id: z.uuid(),
  couple_id: z.uuid(),
  recipient_id: z.uuid(),
  actor_id: z.uuid().nullish(),
  key: z.enum(NOTIFY_KEYS),
  category: z.enum(NOTIFY_CATEGORIES),
  title: z.string(),
  body: z.string(),
  target: z.string(),
  target_id: z.string().nullish(),
  read: z.boolean(),
  created_at: z.string(),
});
export type AppNotification = z.infer<typeof notificationSchema>;
```

No input schema needed for list; PATCH (`[id]`) and POST (`read-all`) take no body.

### 3.2 Service — extend `src/lib/services/notifications.ts`

- Add `persistNotification(admin, { coupleId, recipientId, actorId, key, category, title, body, target, targetId })`
  using `createAdminClient()` (bypasses RLS, mirrors how pushes are sent).
- Refactor `notifyPartner` so, for each eligible partner, it builds the payload
  (`buildPayload(key, locale, vars)`) and **both** sends the push **and** persists a row
  (localized to that recipient's `sub.locale` when a subscription exists, else `fr`).
  This keeps a single source of truth — every push now also creates an in-app entry.
- Add read-side functions (RLS client, recipient-scoped):
  - `listNotifications(supabase, userId): Promise<AppNotification[]>` — `order created_at desc limit 100`.
  - `markNotificationRead(supabase, userId, id)` — `update ... set read=true where id=... and recipient_id=userId`.
  - `markAllNotificationsRead(supabase, userId)` — `update ... set read=true where recipient_id=userId and not read`.
  - `deleteNotification(supabase, userId, id)` (optional, for swipe-to-dismiss).

These throw `ApiError`/`fail.*` on error and never silently return null.

### 3.3 API routes — `defineRoute`

- `src/app/api/notifications/route.ts`
  - `GET` → `listNotifications(supabase, user.id)`
  - `POST` → `markAllNotificationsRead(supabase, user.id)` (no body)
- `src/app/api/notifications/[id]/route.ts`
  - `PATCH` → `markNotificationRead(supabase, user.id, params.id)` (no body)
  - `DELETE` (optional) → `deleteNotification(...)`

All via `defineRoute` (no hand-rolled auth/status; `fail.unauthorized()` etc. only server-side).

---

## 4. Client data flow

### 4.1 Query keys — `src/lib/query/keys.ts`

```ts
notifications: () => ["notifications"] as const,
```

### 4.2 Hooks — `src/hooks/use-notifications.ts`

- `useNotifications()` → `useQuery({ queryKey: queryKeys.notifications(), queryFn: () => apiFetch<AppNotification[]>("/api/notifications") })`
- `useUnreadCount()` → derived `useNotifications().data?.filter(n => !n.read).length ?? 0`
- `useMarkNotificationRead()` → `useMutation` `PATCH /api/notifications/${id}` with **optimistic**
  `setQueryData` flipping `read: true` (rollback on error, `invalidate` on settle — same pattern
  as `use-love-notes.ts`).
- `useMarkAllNotificationsRead()` → optimistic set all `read: true`.

### 4.3 Realtime — `src/components/providers/realtime-provider.tsx`

Add a `postgres_changes` listener for `table: "notifications"` filtered by `couple_id`,
calling `invalidate(queryKeys.notifications())`. This is how a partner's action appears live
in the panel.

---

## 5. UI components (atomic & dumb, reuse primitives)

Reuse: `Sheet`, `Button`, `Card`, `EmptyState`, `cn`, `springBouncy`/`tapScale`, `timeAgo`,
`useTranslations`.

New, deliberately atomic:

1. **`src/components/features/notifications/notification-glyph.tsx`** (dumb)
   - Props: `{ category: NotifyCategory, className? }`
   - Maps category → lucide icon + theme color (`chores`→ListTodo, `moods`→Smile,
     `status`→CircleDot, `pet`→Dog, `love`→Heart, `dates`→CalendarHeart, `home`→House).
   - Small circular tinted background using the couple color theme tokens.

2. **`src/components/features/notifications/notification-item.tsx`** (dumb)
   - Props: `{ notification, onOpen, onMarkRead }`
   - Renders glyph + title + 1-line `body` (truncate) + `timeAgo(created_at, locale)` +
     unread dot (`bg-primary`) + "Go to" `Button` (variant `ghost`, `size="sm"`).
   - `whileTap={tapScale}`; unread rows get a subtle `bg-surface-muted` tint.

3. **`src/components/features/notifications/notification-list.tsx`**
   - Props: `{ items, onOpen, onMarkRead, onMarkAll, hasUnread }`
   - Maps `notification-item`; if empty → `EmptyState` (emoji 🔔, i18n `empty`/`emptyHint`).
   - Header row: panel title + "mark all read" `Button` (hidden when no unread).

4. **`src/components/features/notifications/notification-panel.tsx`**
   - Props: `{ open, onOpenChange }`
   - Wraps `Sheet` (reuse `sheet.tsx`); inside renders `notification-list` wired to the hooks.
   - Title via `useTranslations("notifications.inApp")`.

5. **`src/components/features/notifications/notification-bell.tsx`**
   - Fixed top-right trigger mounted in the `(app)` layout.
   - Uses `useNotifications()` + `useUnreadCount()`; shows a `Badge` (new small component or
     inline) with the count when `> 0`.
   - Owns `open` state, renders `NotificationPanel`; on "Go to" does
     `router.push(notification.target)` (next-intl `useRouter` — locale auto-prefixed),
     fires `useMarkNotificationRead`, and closes the sheet.

### 5.1 Mounting

In `src/app/[locale]/(app)/layout.tsx`, inside the `<main>` wrapper add
`<NotificationBell />` (fixed top-right, `z-30`, safe-area top padding) so it appears on every
authenticated page.

---

## 6. "Go to" navigation

Stored `target` is a locale-agnostic route (`/notes`, `/chores`, `/pet`, `/meals`,
`/expenses`, `/coupons`, `/dates`, `/question`, `/moods`, `/bucket`, `/grocery`). For richer
deep-linking, persist `target_id` too (e.g. the love-note id) and navigate to
`` `${target}?id=${target_id}` `` — pages can optionally read `?id=` to scroll/highlight.
Out of scope for v1: route-only navigation (matches current push `url`).

---

## 7. i18n — `src/i18n/messages/{fr,zh}.json`

Extend the existing `notifications` block with an `inApp` sub-object:

```json
"notifications": {
  "...existing keys...",
  "inApp": {
    "panelTitle": "Notifications",
    "panelSubtitle": "Ce que ton amour a fait 💌",
    "empty": "Pas encore de notifications",
    "emptyHint": "On te dira dès qu'il se passe quelque chose ✨",
    "markAllRead": "Tout marquer comme lu",
    "goTo": "Voir",
    "unread": "{count} non lues"
  }
}
```

Mirror in `zh.json`. No hard-coded copy anywhere.

---

## 8. REPO_MAP updates (`docs/REPO_MAP.md`)

- §2 Directory map: note `notifications` table + `use-notifications.ts` hook.
- §4: document that `notifyPartner` now **persists** an in-app row in addition to pushing.
- §6: add `queryKeys.notifications()` and the realtime `notifications` listener.
- §8 checklist: add a step "persist + reconcile in-app notifications via the notifications service".
- Add a short "In-app notifications" convention note: every new `NotifyKey` automatically
  yields both a push and an in-app entry; the `target` route must point at an existing
  `(app)` route.

---

## 9. Build order (implementation checklist)

1. Migration `0015_in_app_notifications.sql` → `bun run gen:types`.
2. `src/lib/schemas/notification.ts`.
3. Extend `src/lib/services/notifications.ts` (persist + list/read).
4. `src/app/api/notifications/route.ts` + `[id]/route.ts` (`defineRoute`).
5. `queryKeys.notifications()` in `keys.ts`.
6. `src/hooks/use-notifications.ts`.
7. Realtime listener in `realtime-provider.tsx`.
8. UI: `notification-glyph` → `notification-item` → `notification-list` →
   `notification-panel` → `notification-bell`.
9. Mount `NotificationBell` in `(app)/layout.tsx`.
10. i18n keys (fr + zh).
11. `npm run lint` + `next build`.

---

## 10. Open decisions (please confirm)

- **Localization timing:** plan persists `title`/`body` localized at creation (matches the
  push path). Alternative: store `key` + `actor_name` + `extra` and localize at render via a
  client-side `NOTIFY` mirror — more i18n-correct if the user switches locale, but duplicates
  the catalog. *(Recommended: creation-time, like push.)*
- **Full page vs sheet only:** plan ships the sheet panel triggered by a bell (no new bottom-nav
  entry). A standalone `/notifications` page is optional and not included.
- **Deep-link precision:** v1 navigates to the feature route only (e.g. `/notes`). Capturing
  `target_id` for scroll-to-item is stubbed but unused until pages support `?id=`.
- **Self notifications:** rows are created only for the *partner* (recipient ≠ actor), exactly
  like pushes. No "you did X" entries.
