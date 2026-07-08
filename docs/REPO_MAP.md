# Repository Map — lolo-and-lili

A couple/shared-life PWA built with a **non-standard Next.js 16** (App Router, React 19),
Supabase (Postgres + Auth + Realtime), TanStack Query, and `next-intl` i18n.

> ⚠️ This is **not** the Next.js you know from training data. APIs, conventions, and
> file structure have breaking changes. Before writing any code, read the bundled docs in
> `node_modules/next/dist/docs/` (start at `index.md`, `03-architecture`). Heed deprecation
> notices. The guidance in this file is derived from the actual code in this repo; when in
> doubt, match existing code.

---

## 1. Tech Stack & Libraries

| Concern | Library | Notes |
|---|---|---|
| Framework | `next@16.2.10` (App Router) | `cookies()`, `params`, `requestLocale` are all **async** and must be `await`ed. |
| React | `react@19.2.4` | Server Components by default. |
| DB / Auth / Realtime | `@supabase/supabase-js` + `@supabase/ssr` | Three clients — browser, server, admin (service-role). |
| Client data | `@tanstack/react-query@5` | Single cache source of truth, reconciled by Realtime. |
| Validation | `zod@4` | Every request body / action input is a zod schema. |
| i18n | `next-intl@4` | Locales: `fr` (default), `zh`. Locale prefix always in URL. |
| Styling | `tailwindcss@4` + `tailwind-merge` + `clsx` | Custom design tokens (see §7). |
| Animation | `motion@12` (`motion/react`) | `cn` for class names, `springBouncy`/`tapScale` for feel. |
| Icons | `lucide-react` | |
| Toasts | `sonner` | Rendered once in root layout. |
| Push | `web-push` | Service-role client only. |
| Dates | `date-fns@4` | |
| Misc UI | `vaul` (drawer/sheet), `lottie-react`, `canvas-confetti`, `next-themes` | |

Package manager: **bun** (`bun.lock` is committed). Scripts in `package.json`:
`dev`, `build`, `start`, `lint` (eslint), `gen:types` (regenerates Supabase TS types).

---

## 2. Directory Map

```
src/
  app/
    [locale]/                 # i18n root. layout.tsx sets up providers + Toaster + SW.
      (app)/                  # Authenticated app shell (auth + couple gate, bottom nav).
        <feature>/page.tsx    # One folder per feature (chores, meals, pet, ...).
      (auth)/                 # Login / magic-link flow.
    actions/                  # Server Actions ("use server") — thin wrappers over services.
    api/                      # Route Handlers (REST). One folder per feature, [id] for nested.
  components/
    features/<feature>/       # Feature UI (client components), e.g. chore-list.tsx.
    ui/                       # Generic primitives (Button, Card, Sheet, Switch, ...).
    providers/                # Context providers (Query, Couple, Realtime, ColorTheme).
    nav/                      # BottomNav and app navigation.
    pwa/                      # Service-worker registration.
  hooks/                      # One use-<feature>.ts per feature: TanStack Query hooks.
  i18n/                       # next-intl routing, request config, messages/<locale>.json.
  lib/
    api/                      # THE CONTRACT: defineRoute, defineAction, result, http.
    schemas/                  # zod schemas, one file per feature.
    services/                 # Business logic. Pure-ish functions (supabase, user, input).
    query/                    # queryKeys (cache keys) + apiFetch client.
    supabase/                 # client.ts (browser), server.ts, admin.ts, config, types.
    notifications/            # Web-push payload building + web-push wrapper.
    *.ts                      # Domain helpers (chores, pets, moods, motion, utils, auth, ...).
  global.d.ts, proxy.ts       # Global types + Supabase auth proxy (session refresh).
supabase/
  migrations/                 # Ordered SQL migrations (0001_init ... 0014_nudges).
  templates/                  # Email templates (otp, magic-link).
  reset.sql / reset-and-reinit.sql
scripts/                      # build helpers (gen-pet-lottie.mjs).
public/                       # Static assets + service worker / PWA files.
```

---

## 3. The Request Contract (MUST follow)

All server logic flows through four building blocks in `src/lib/api/`. Every new
endpoint or action **must** use them — do not hand-roll auth/validation/response.

- **`defineRoute({ input?, handler })`** (`define-route.ts`) — for Route Handlers in
  `src/app/api/**`. Injects `{ req, input, supabase, user, params }`, requires an
  authenticated user, validates the JSON body against the zod `input` schema, and returns
  the standard envelope.
- **`defineAction(schema, handler)`** (`define-action.ts`) — for Server Actions in
  `src/app/actions/**`. Same guarantees, returns an `ApiResult<T>` directly.
- **`result.ts`** — `ApiResult<T>` envelope (`{ ok: true, data }` | `{ ok:false, error }`),
  `ErrorCode`, `HTTP_STATUS` map, `ApiError`, and `fail.*` throwers. **Never hard-code HTTP
  status numbers** — use `fail.unauthorized()/forbidden()/notFound()/conflict()`.
- **`http.ts`** — `jsonOk` / `jsonError` / `toErrorResponse`.

Service/route handlers **throw** `ApiError` on failure; the wrappers convert it to the
envelope + correct status. Unknown thrown errors become `INTERNAL` with no leak.

### Example route (`src/app/api/chores/route.ts`)
```ts
import { defineRoute } from "@/lib/api/define-route";
import { createChoreSchema } from "@/lib/schemas/chore";
import { createChore, listChores } from "@/lib/services/chores";

export const GET = defineRoute({ handler: ({ supabase }) => listChores(supabase) });
export const POST = defineRoute({
  input: createChoreSchema,
  handler: ({ supabase, user, input }) => createChore(supabase, user, input),
});
```

### Example action (`src/app/actions/couples.ts`)
```ts
"use server";
import { defineAction } from "@/lib/api/define-action";
import { renameCoupleSchema } from "@/lib/schemas/profile";
import { renameCouple } from "@/lib/services/couples";

export const renameCoupleAction = defineAction(
  renameCoupleSchema,
  async ({ input, supabase, user }) => renameCouple(supabase, user, input.name),
);
```

---

## 4. Layering: route/action → service → supabase

Keep a strict separation:

1. **`src/lib/schemas/<feature>.ts`** — zod schema for the input. Name exports
   `<Verb><Noun>Schema` (e.g. `createChoreSchema`) and infer `type <Verb><Noun>Input`.
   Schemas may import domain constants from `src/lib/<feature>.ts` (e.g. `recurrences`).
2. **`src/lib/services/<feature>.ts`** — the logic. Functions take
   `(supabase, user, input)` and return typed data. They call `throw new ApiError(...)` or
   `fail.*` on error and convert Supabase errors (`if (error) throw ...`) — never return
   `null`/`undefined` on failure silently. Server-only services may import `notifications`
   (marked `import "server-only"`).
3. **`src/app/api/<feature>/route.ts`** or **`src/app/actions/<feature>.ts`** — thin glue
   via `defineRoute`/`defineAction`. No business logic here.
4. **`src/hooks/use-<feature>.ts`** — client-only TanStack Query hooks that call `apiFetch`.
5. **`src/components/features/<feature>/*`** — presentational client components consuming hooks.

### Couple scoping (security-critical)
- The user belongs to a **couple** (`couple_id` on `profiles`). Most data is couple-scoped.
- Use `requireCoupleId(supabase, user)` (`lib/services/couples.ts`) to get the couple id and
  throw `FORBIDDEN` if the user has no couple.
- **RLS enforces scoping** — every query must include the `couple_id` filter so Postgres
  policies apply. Never rely on client-side filtering for security.
- The **admin (service-role) client** (`lib/supabase/admin.ts`) bypasses RLS. Only use it
  for cross-boundary operations that are impossible under RLS (e.g. invite-code lookup,
  sending Web Push). Keep the caller's RLS-enforced client for any write the user owns.
  It is `server-only` — never import into a Client Component.

---

## 5. Validation rules (NON-NEGOTIABLE)

- Every route body and every action input is validated by a **zod schema** before the
  handler runs. No exceptions.
- Use `.trim()`, `.min()/.max()` for strings; `.uuid()` for ids; `.int().min().max()` for
  numbers; `enum` for fixed sets; `.nullish()` for optional nullable fields.
- IDs are **client-generated UUIDs** for create operations so the optimistic cache row and
  the persisted row share an id (prevents list flicker — see §6).
- On validation failure the wrapper returns `VALIDATION` (422) with `z.flattenError(...)`
  field errors — perfect for form error display.

---

## 6. Client data flow & optimistic updates

- `src/lib/query/client.ts` `apiFetch<T>` unwraps the `ApiResult` envelope and **throws an
  `ApiError`** on failure so TanStack Query surfaces errors via `error`. Use `jsonBody(data)`
  for mutation bodies.
- **`src/lib/query/keys.ts`** holds ALL cache keys (`queryKeys.<feature>()`). Add new keys
  here so realtime and mutations stay consistent.
- Mutations follow the **optimistic pattern** (`use-chores.ts` is the reference):
  `onMutate` → `cancelQueries` + snapshot previous + `setQueryData` optimistic patch;
  `onError` → roll back to snapshot; `onSettled` → `invalidateQueries`.
- **Realtime** (`components/providers/realtime-provider.tsx`) subscribes to one channel per
  couple and `invalidateQueries` the relevant `queryKeys` on Postgres Changes. This is how
  the partner's actions appear live. When adding a table, register its `postgres_changes`
  listener here (and a `queryKeys` entry).

---

## 7. Coding conventions (MUST follow)

- **Imports:** use the `@/*` path alias (`tsconfig` → `./src/*`). Never relative `../..`.
- **Class names:** always `cn(...)` from `@/lib/utils` (clsx + tailwind-merge).
- **Animation:** prefer `motion/react`; reuse `springBouncy`, `tapScale`, `popIn`,
  `staggerContainer` from `@/lib/motion`. Keep the "cute/bouncy" feel — no plain CSS
  transitions on interactive elements without reason.
- **i18n:** all user-facing strings go through `next-intl` (`useTranslations` / `getTranslations`)
  with keys in `src/i18n/messages/<locale>.json`. Never hard-code UI copy. Default locale is
  `fr`; do not assume English.
- **Server vs Client:** default to Server Components. Add `"use client"` only to components
  that use hooks/state/motion events. Server Actions are `"use server"`.
- **Auth gate:** `(app)/layout.tsx` redirects unauthenticated users to `/login` and solo
  users to `<Onboarding/>`. New `(app)` pages automatically inherit these gates.
- **Type safety:** `strict: true`. Use generated `Database` types from
  `src/lib/supabase/database.types.ts` (regenerate with `npm run gen:types` after schema
  changes). Import `type { Database }` and `type { Profile, ... }` from `@/lib/supabase/types`.
- **No secrets:** never log secrets/keys; `.env.local`/`.env` are git-ignored. Use
  `process.env` only server-side.
- **Lint/format:** ESLint via `eslint.config.mjs` (next core-web-vitals + typescript).
  Run `npm run lint` before committing. Comments: code is otherwise uncommented by convention
  — keep comments only where they explain *why* (the repo uses explanatory comments heavily,
  so follow the existing explanatory style for non-obvious logic).

---

## 8. How to add a new feature (checklist)

1. **DB (if needed):** add a migration in `supabase/migrations/NNNN_<name>.sql` with RLS
   policies scoping rows to `couple_id`. Regenerate types: `npm run gen:types`.
2. **Schema:** `src/lib/schemas/<feature>.ts` — zod input schema(s).
3. **Service:** `src/lib/services/<feature>.ts` — functions `(supabase, user, input) => ...`,
   throwing `ApiError`/`fail.*` on error; `requireCoupleId` for couple scoping.
4. **API:** `src/app/api/<feature>/route.ts` (and `[id]` subfolder for item ops) using
   `defineRoute`. Or a Server Action under `src/app/actions/<feature>.ts` via `defineAction`.
5. **Query keys:** add `queryKeys.<feature>()` in `src/lib/query/keys.ts`.
6. **Hooks:** `src/hooks/use-<feature>.ts` with `useQuery`/`useMutation` + optimistic pattern.
7. **Realtime:** register the new table in `realtime-provider.tsx` if it should sync live.
8. **UI:** `src/components/features/<feature>/*` (client components) using the hook; reuse
   `components/ui` primitives. Use `next-intl` for all copy.
9. **Page:** `src/app/[locale]/(app)/<feature>/page.tsx` (Server Component, `setRequestLocale`
   + `getTranslations`) rendering the feature component. Add nav entry in `components/nav`.
10. **i18n:** add string keys to all `src/i18n/messages/*.json` locales.
11. **Notifications (optional):** add a `NotifyKey` + message in `lib/notifications/messages`
    and call `notifyPartner` from the service (best-effort).
12. Run `npm run lint` and `npm run build` (or `next build`) to verify.

---

## 9. Env & running

- Copy `.env.example` → `.env.local`. Required: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), `VAPID_*` for
  web push.
- `npm run dev` (or `bun dev`) → http://localhost:3000. Locale-prefixed routes (`/fr`, `/zh`).
- Supabase local: migrations live in `supabase/migrations`; reset with the SQL scripts there.

---

## 10. Hard rules summary (cannot be ignored)

1. Use `defineRoute`/`defineAction` + zod for **every** server entry point. No hand-rolled
   auth, validation, or status codes.
2. Validate **all** inputs with zod; throw via `ApiError`/`fail.*`.
3. Scope **all** couple data by `couple_id`; rely on RLS; never trust client filtering.
4. Service-role (admin) client only server-side, only for RLS-bypassing needs.
5. Centralize cache keys in `queryKeys`; reconcile via Realtime; use optimistic mutations.
6. Use `@/*` imports, `cn()` for classes, `motion/react` for animation, `next-intl` for copy.
7. Run `npm run lint` (and `build`) before finishing; keep `strict` TypeScript clean.
8. Read `node_modules/next/dist/docs/` before writing Next-specific code — this is Next 16
   with breaking changes (async `cookies`/`params`/`requestLocale`).
