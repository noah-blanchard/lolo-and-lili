# 04 — Master Remediation Plan

Prioritized, atomic tasks derived from findings `F-###` in reports [01](./01-global-audit-summary.md), [02](./02-deep-dive-performance-memory.md), [03](./03-ui-ux-platform-parity.md). Each task is self-contained so a fresh coding agent can execute it without reading the other reports first — but the cited finding sections explain *why*.

**Repo rules that apply to every task** (from `docs/REPO_MAP.md`, non-negotiable): zod on every server input via `defineRoute`/`defineAction`; throw `ApiError`/`fail.*` (never hard-code status numbers); couple-scope all data and rely on RLS; `@/*` imports; `cn()` for classes; `motion/react` for animation; all copy through `next-intl` (add keys to **both** `src/i18n/messages/fr.json` and `zh.json`); package manager is **bun**. After each task run the verification listed, and at minimum `bunx tsc --noEmit` plus `bun run build`. Once TASK-01 lands, also `bun run lint`.

**Priorities:** P0 security/broken-tooling → P1 correctness/resilience → P2 performance → P3 UX/platform polish → P4 hygiene.

---

## P0 — Security & broken tooling

### TASK-01 — Repair the lint pipeline
- **Findings:** F-006 · **Files:** `eslint.config.mjs`, root `package.json`
- **Steps:** `bun run lint` currently crashes because `eslint.config.mjs:2` imports `eslint-plugin-storybook`, which is a dependency of the `storybook` workspace, not the root. Either (a) add `eslint-plugin-storybook` to root `devDependencies`, or (b) — simpler, since `storybook/**` is already in `globalIgnores` (line 20) — delete the import and the `...storybook.configs["flat/recommended"]` spread (line 21). Option (b) recommended. Then fix whatever violations surface (expect the `@next/next/no-img-element` disable in `src/app/[locale]/loading.tsx` to remain the only one).
- **Accept:** `bun run lint` exits 0. Consider adding it to a pre-push hook or CI so it can't silently rot again (Next 16 no longer lints during build).

### TASK-02 — Enforce two-member couples
- **Findings:** F-001 · **Files:** `src/lib/services/couples.ts`, new `supabase/migrations/0018_couple_member_limit.sql`
- **Steps:**
  1. In `joinCouple` (couples.ts:47-68), after the invite-code lookup, count profiles with the admin client: `admin.from("profiles").select("id", { count: "exact", head: true }).eq("couple_id", couple.id)`; if `count >= 2` and the caller isn't already one of them, `throw fail.conflict(...)` (add fr/zh copy for the client toast if surfaced).
  2. Defense in depth in the migration: a `before insert or update of couple_id on public.profiles` trigger that raises when the target couple already has 2 other members (a check constraint can't do cross-row counts).
  3. Follow the repo checklist: `bun run gen:types` after the migration.
- **Accept:** a third account using a valid invite code gets a `CONFLICT` envelope; existing two-member couples unaffected; direct SQL insert of a third profile fails.

### TASK-03 — Stop leaking Postgres error strings to clients
- **Findings:** F-005 · **Files:** `src/lib/api/http.ts`, `src/lib/api/define-action.ts` (central fix — do **not** touch all services)
- **Steps:** in `toErrorResponse` and the `ApiError` branch of `defineAction`, when `error.code === ErrorCode.INTERNAL`: `console.error` the original message/details server-side, then respond with the generic `"Something went wrong"` and no details. Non-INTERNAL codes keep their (intentional, user-facing) messages.
- **Accept:** force a DB error (e.g. temporarily insert an invalid column in one service in dev) and confirm the response body contains no Postgres/PostgREST text while the server log does.

### TASK-04 — Rate-limit abuse-prone endpoints
- **Findings:** F-002 · **Files:** `src/lib/api/` (new `rate-limit.ts` helper), `src/app/actions/couples.ts` (join), `src/app/api/notes/nudge/route.ts`, `src/app/api/nudges/route.ts`, `src/app/api/push/test/route.ts`
- **Steps:** implement a small fixed-window limiter keyed by `user.id` + bucket name. Simplest durable option in this stack: a `rate_limits` table (`key text pk, window_start timestamptz, count int`) written with the caller's client via an upsert RPC, or in-memory `Map` if single-instance deployment is acceptable (document the trade-off). Throw `new ApiError(ErrorCode.RATE_LIMITED, ...)` — the code and its 429 mapping already exist (`src/lib/api/result.ts:10,23`). Suggested budgets: join attempts 5/hour; nudges 6/minute; push test 3/minute.
- **Accept:** exceeding the budget returns the envelope with `RATE_LIMITED`/429; normal use unaffected.

---

## P1 — Correctness & resilience

### TASK-05 — Add error boundaries
- **Findings:** F-012 · **Files:** new `src/app/[locale]/(app)/error.tsx`, `src/app/[locale]/error.tsx`, `src/app/global-error.tsx`
- **Steps:** per bundled docs `01-app/01-getting-started/10-error-handling.md`: client components receiving `{ error, reset }`. The `(app)` one should keep the app frame feel: a `Card` with an apologetic i18n message (`useTranslations`), a retry `Button` calling `reset()`, styled with existing `cn`/motion primitives. `global-error.tsx` must render its own `<html>/<body>` and can't use next-intl (hard-code both languages or keep it minimal).
- **Accept:** throwing inside any feature component in dev shows the friendly boundary with working retry — bottom nav still visible for `(app)` errors; the app never white-screens.

### TASK-06 — Fix `markAllNotificationsRead` count
- **Findings:** F-007 · **Files:** `src/lib/services/notifications.ts:222-233`
- **Steps:** add `{ count: "exact" }` to the update: `.update({ read: true }, { count: "exact" })`.
- **Accept:** response `updated` reflects the real number of rows changed.

### TASK-07 — Small data-integrity fixes
- **Findings:** F-003, F-004, F-011 · **Files:** `src/lib/services/love-notes.ts`, `src/lib/schemas/love-note.ts`, `src/lib/services/chores.ts`, `src/lib/services/expenses.ts`
- **Steps:**
  1. `openLoveNote`: ignore client `opened_at`; set `new Date().toISOString()` server-side (keep the schema field removed or optional-and-ignored; update the optimistic patch in the hook to keep using its local time — ids reconcile on invalidate).
  2. `createChore`: after `requireCoupleId`, if `input.assignee_id` is set, verify it belongs to the couple (reuse `getCoupleMembers` or a single select); else `fail.forbidden(...)`.
  3. `addExpense`/`settleUp`: reject (or convert) a new expense whose `currency` differs from existing rows — simplest: drop the `currency` input and hard-code EUR (it's always defaulted today), or scope `computeBalance` to a single currency and refuse mixed ledgers with `CONFLICT`.
- **Accept:** tsc/build green; manual: opening a note stamps server time; assigning a chore to a random UUID fails; mixed-currency settle is impossible.

### TASK-08 — Order-of-operations & races in pet care
- **Findings:** F-008, F-009 · **Files:** `src/lib/services/pets.ts`
- **Steps:**
  1. In `care()` move the `pet_actions` insert (line 183) **after** the cuddle "already done today" check (lines 194-199), so a rejected cuddle leaves no orphan row. Note `hasActionToday` currently excludes the just-inserted row via `.lt("created_at", now)` — after reordering, drop that exclusion.
  2. For treats read-modify-write races (`spendTreats`, `awardTreats`, `rewardFromChore`): create a small SQL RPC `adjust_treats(pet_id uuid, delta int)` doing `update pets set treats = greatest(0, treats + delta)` atomically (migration + `gen:types`), and call it instead of read-then-write. `settleUp`: add a unique guard or re-check balance inside a single insert-select.
- **Accept:** double-tapping cuddle produces one action row and one CONFLICT; concurrent chore completions never lose treats (verify with two parallel `curl`s in dev).

### TASK-09 — Service worker registration race
- **Findings:** F-027 · **Files:** `src/components/pwa/service-worker-register.tsx`
- **Steps:** replace the bare `load` listener with: `if (document.readyState === "complete") { onLoad(); return; }` else add the listener (keep the cleanup).
- **Accept:** with DevTools → Application, the SW registers even when hydration completes after `load` (throttle CPU to reproduce); no double registration.

### TASK-10 — Make notification taps deep-link when the app is open
- **Findings:** F-043 · **Files:** `public/sw.js:84-93`
- **Steps:** in `notificationclick`, when an existing window client is found: `existing.navigate(target).then((w) => (w ?? existing).focus())`, falling back to `openWindow(target)` on failure. Prefer a client whose URL is same-origin app scope over "any window". Bump the SW `VERSION` string so caches roll.
- **Accept:** with the PWA open on `/fr/pet`, tapping a chore push lands on `/fr/chores` (proxy adds the locale).

---

## P2 — Performance (navigation feel)

> Recommended order: TASK-11 → TASK-12 → TASK-13 → TASK-14; each stands alone, but the visual payoff compounds. Re-read report 02 §1 before starting.

### TASK-11 — Collapse the server data waterfall
- **Findings:** F-022 · **Files:** `src/lib/auth.ts`, `src/app/[locale]/(app)/layout.tsx`, `src/app/[locale]/(app)/page.tsx`
- **Steps:**
  1. Wrap `getProfile` in `React.cache` exactly like `getSession` (`auth.ts:9`).
  2. In the layout, derive `me` from the `getCoupleMembers` result (it already contains the caller's profile) — keep `getProfile` only for the couple gate, or fetch members first and gate on `members`-derived data. Net: ≤2 queries instead of 3.
  3. On the home page, replace the separate `couples` select with a joined select or accept the (now cached) profile + one query.
- **Accept:** count Supabase queries per navigation in dev logs: layout ≤2, home ≤2; behavior unchanged (gates still redirect).

### TASK-12 — Server-prefetch TanStack Query data (flagship fix)
- **Findings:** F-021, F-020 · **Files:** pattern change; start with `src/app/[locale]/(app)/page.tsx`, `chores/page.tsx`, `notes/page.tsx`, `pet/page.tsx`, then roll to the remaining feature pages. Touches nothing in hooks/components.
- **Steps (per page):** create a server `QueryClient`, `await qc.prefetchQuery({ queryKey: queryKeys.chores(), queryFn: () => listChores(supabase) })` calling the **service directly** (the page already runs authenticated — no HTTP hop), then wrap the page content in `<HydrationBoundary state={dehydrate(qc)}>`. Query keys **must** come from `src/lib/query/keys.ts` so they match the client hooks. Keep the client hooks untouched — they hydrate instantly and stay live via realtime. Consult bundled docs `01-app/01-getting-started/06-fetching-data.md` and TanStack's SSR guide; note services throwing `ApiError` inside RSC render will surface to the (new, TASK-05) error boundary — acceptable.
- **Accept:** navigating to a prefetched page renders data in the first paint after the RSC arrives — the per-feature skeleton (e.g. `chore-list.tsx:25-33`) no longer appears on normal navigation (verify by throttling network and watching states); realtime updates still arrive.

### TASK-13 — Per-route loading skeletons
- **Findings:** F-040 · **Files:** new `loading.tsx` in each `src/app/[locale]/(app)/<feature>/` folder; slim down the shared `(app)/loading.tsx`
- **Steps:** after TASK-12, the route-level skeleton is the only loading state left. Give each feature folder a `loading.tsx` mirroring its real geometry (header width, list rows vs grid vs planner — reuse `Skeleton` from `@/components/ui/skeleton`). Hubs (`/maison`, `/nous`) fetch nothing: their `loading.tsx` should be the header + 2×2 `HubCard`-shaped grid so the swap is imperceptible. Keep the shared `(app)/loading.tsx` as the home-page skeleton only by moving it into the page's own segment… note: the home page is `(app)/page.tsx`, so its skeleton must stay at `(app)/loading.tsx` — that's fine once every other route has its own boundary (more specific segments win).
- **Accept:** on a throttled connection, every route's skeleton visually matches what replaces it (no layout jump > one text line).

### TASK-14 — Remove the inert transition wrapper; tame the template animation
- **Findings:** F-020 (steps 4–5) · **Files:** `src/components/ui/page-transition.tsx` (delete), `src/app/[locale]/(app)/layout.tsx:11,42`, `src/app/[locale]/(app)/template.tsx`
- **Steps:** delete `PageTransition` and unwrap `{children}` in the layout (the `AnimatePresence mode="wait"` does nothing — see report 02 §1 step 5 for why; also delete the unreachable `exit` prop in `template.tsx`). Then choose one: (a) keep the template's entry spring but shorten/soften it so it doesn't amplify skeleton swaps, or (b) delete `template.tsx` and adopt React `ViewTransition` per bundled docs `01-app/02-guides/view-transitions.md` for a real cross-fade. Option (a) is the safe default; (b) is the better end-state but experimental — timebox it.
- **Accept:** navigation shows at most one animated entrance; no dead code remains; bouncy feel preserved (repo rule).

### TASK-15 — Scope the realtime `profiles` reaction
- **Findings:** F-023 · **Files:** `src/components/providers/realtime-provider.tsx:88-92`, `src/hooks/` (new or existing profile hook), `src/lib/query/keys.ts` (key exists: `profile()`)
- **Steps:** decide what actually needs freshness when a profile row changes: display name/avatar/theme shown in `StatusCard` and the layout. Cheapest correct fix: keep `router.refresh()` **only** for the partner's row changes that affect server-rendered layout data, and debounce it; better fix: move member profiles into a `queryKeys.profile()` query consumed by `CoupleProvider`-dependent UI and invalidate that key instead. Pair with TASK-11 so a refresh is ≤2 queries.
- **Accept:** partner changing accent color updates the UI without re-running every RSC (verify via server logs: no full layout re-render), or at worst one debounced refresh.

### TASK-16 — Cache pet Lottie/sound assets
- **Findings:** F-025 · **Files:** `public/sw.js:44-49`, `src/components/features/pet/pet-avatar.tsx:26-41`
- **Steps:** add `/lottie/` and `/sounds/` prefixes to the SW stale-while-revalidate matcher; in `useLottie`, cache fetched JSON in a module-level `Map<slot, object>` (or TanStack cache) so state flips don't refetch. Bump SW `VERSION`.
- **Accept:** switching pet states re-uses cached JSON (Network tab: one fetch per slot per session; served from SW cache on repeat visits).

---

## P3 — UX & platform parity

### TASK-17 — SSR the color theme; dynamic theme-color
- **Findings:** F-030, F-042 · **Files:** `src/app/[locale]/layout.tsx`, `src/app/[locale]/(app)/layout.tsx`, `src/components/providers/color-theme-provider.tsx`, `src/lib/themes.ts`
- **Steps:**
  1. The root layout renders `<html>` but doesn't know the user; the `(app)` layout knows `me.theme_pref` but can't touch `<html>`. Bridge with a cookie: when the user changes theme (`ColorThemeProvider.setTheme`) also write a `color-theme` cookie; root layout reads `await cookies()` and renders `<html data-color-theme={...} style={{colorScheme}}>` (falls back to peach). Keep the client applier for live switching.
  2. In `applyTheme`, also update `<meta name="theme-color">` to the theme's `--background` (add the hex per theme in `src/lib/themes.ts`), replacing the static `viewport.themeColor`.
- **Accept:** cold-loading as a midnight user shows dark from first paint (disable JS to verify no flash); the browser/status-bar chrome matches the active theme on both platforms.

### TASK-18 — Remove the zoom lock
- **Findings:** F-041 · **Files:** `src/app/[locale]/layout.tsx:36`
- **Steps:** delete `maximumScale: 1` from the viewport export.
- **Accept:** pinch-zoom works on Android Chrome; layout unaffected.

### TASK-19 — Sheet uses dynamic viewport units
- **Findings:** F-046 · **Files:** `src/components/ui/sheet.tsx:34`
- **Steps:** `max-h-[80vh]` → `max-h-[80dvh]`.
- **Accept:** in iOS Safari (browser mode) with keyboard open, the sheet's scroll area stays fully reachable.

### TASK-20 — Redirect signed-in users off the auth pages
- **Findings:** F-048 · **Files:** `src/app/[locale]/(auth)/layout.tsx`
- **Steps:** mirror the app gate inversely: `const { user } = await getSession(); if (user) redirect(\`/${locale}\`);`.
- **Accept:** visiting `/fr/login` while signed in lands on `/fr`.

### TASK-21 — Localize the last hard-coded copy
- **Findings:** F-049 · **Files:** `src/components/ui/spinner.tsx:27`, `src/components/features/pet/pet-screen.tsx:95`, `src/components/features/chores/chore-card.tsx:46,67`, `src/components/features/notifications/notification-bell.tsx:18`, `src/app/api/push/test/route.ts:12-14`, both message JSONs
- **Steps:** add an `a11y` (or per-feature) namespace with fr/zh strings for the five `aria-label`s and use `useTranslations`. For the test push, build the payload via the existing `buildPayload`/messages mechanism (`src/lib/notifications/messages.ts`) with the caller's locale instead of inline French.
- **Accept:** grep for `aria-label="[A-Za-z]` returns nothing hard-coded; test push arrives in the device's saved locale; fr/zh key parity preserved.

### TASK-22 — Manifest & icon cleanup
- **Findings:** F-044, F-045, §3 icon notes · **Files:** delete `public/site.webmanifest`; `src/app/manifest.ts`; `public/` (new maskable PNG)
- **Steps:** delete the stale manifest; restore the French description (line 7) as the shipped one (or generate per-locale manifests later); add a 512×512 maskable **PNG** entry alongside the SVG; optionally add a monochrome badge PNG and reference it in `sw.js` `badge`.
- **Accept:** Lighthouse PWA pass shows a single manifest, valid maskable icon; installed-app name/colors correct.

---

## P4 — Hygiene

### TASK-23 — Dependency cleanup
- **Findings:** F-026 · **Files:** `package.json`
- **Steps:** `bun remove next-themes`; either `bun remove @tanstack/react-query-devtools` or actually mount `<ReactQueryDevtools>` in `QueryProvider` for dev. Patch-bump `@supabase/supabase-js`, `supabase`, `react`, `react-dom` (`bun update`). Leave TS 7 / ESLint 10 majors for a dedicated task.
- **Accept:** build + tsc green; `bun outdated` shows only intentional holds.

### TASK-24 — Realtime consistency touch-ups
- **Findings:** F-024, F-013 · **Files:** `src/components/providers/realtime-provider.tsx:84-87`, optionally a migration; `src/components/providers/color-theme-provider.tsx`
- **Steps:** either denormalize `couple_id` onto `chore_completions` (migration + backfill + filter in the listener, matching every other listener) or leave as-is with a comment explaining RLS covers delivery — decide once, document. Align provider failure philosophy: once TASK-05's boundaries exist, make `useColorTheme` throw like `useCouple` (or document why it must not).
- **Accept:** listeners are uniformly filtered *or* the exception is documented in code; provider hooks behave consistently.

### TASK-25 — Login cooldown interval micro-fix
- **Findings:** F-029 · **Files:** `src/components/features/auth/login-form.tsx:29-33`
- **Steps:** run the interval once (empty-ish deps, functional decrement, clear at 0) instead of recreating it every second. Purely cosmetic; fold into any P3 touch of this file.
- **Accept:** identical behavior, one interval per countdown.

---

## Execution order & dependencies

```
P0: TASK-01 → (unblocks lint for all later tasks)
    TASK-02, TASK-03, TASK-04            — independent
P1: TASK-05 (before TASK-12: RSC prefetch errors need boundaries)
    TASK-06…TASK-10                       — independent
P2: TASK-11 → TASK-12 → TASK-13 → TASK-14 (this order)
    TASK-15 (after TASK-11), TASK-16      — independent
P3: TASK-17…TASK-22                       — independent of each other
P4: TASK-23…TASK-25                       — anytime after P0
```

Every task ends with: `bunx tsc --noEmit && bun run build && bun run lint` (lint after TASK-01), plus the task's own acceptance check. Migrations additionally require `bun run gen:types` and a note in the PR that migrations 0018+ are pending apply.
