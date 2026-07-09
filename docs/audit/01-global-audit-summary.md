# 01 — Global Audit Summary

**Scope:** full repository audit of `lolo-and-lili` (Next.js 16.2.10 App Router / React 19.2.4 / Supabase / TanStack Query 5 / next-intl 4 / Tailwind 4), performed read-only on 2026-07-09 at commit `a68c673`.
All Next.js judgements were checked against the bundled docs in `node_modules/next/dist/docs/` (this is the non-standard Next 16: async request APIs, `proxy.ts` instead of middleware, Turbopack default, no build-time lint, no bundle-size table in build output).

Findings are numbered `F-###` and referenced by the remediation plan in [04-master-remediation-plan.md](./04-master-remediation-plan.md). Performance/memory detail lives in [02](./02-deep-dive-performance-memory.md), UX/platform detail in [03](./03-ui-ux-platform-parity.md).

---

## 1. Executive summary & health score

This is a **well-architected, unusually disciplined codebase**. The layered request contract (`defineRoute`/`defineAction` → zod → service → RLS-scoped Supabase client) is applied consistently across all 36 route handlers and 3 server-action modules with **zero hand-rolled entry points found**. RLS coverage is complete for every table. TypeScript is strict and compiles clean. fr/zh translations are in perfect key parity (288/288). Mechanical hygiene is excellent: no `any`, no `@ts-ignore`, no stray `console.log`, no `dangerouslySetInnerHTML`, all imports aliased.

The problems are concentrated in three places:

1. **Navigation/perceived-performance architecture** — every page is fully dynamic with client-only data fetching, so each tab switch renders up to three different loading states before content (the user-reported "sluggish switching + wrong skeletons"). Root-cause chain in report 02.
2. **A handful of genuine correctness/security gaps** — a third user can join a couple (F-001), the lint pipeline is completely broken (F-006), raw Postgres error strings leak to clients (F-005), and there is no rate limiting on abuse-prone endpoints (F-002).
3. **Missing resilience layer** — there is **no `error.tsx` anywhere in `src/app`**, so any thrown render/data error unmounts the entire app shell (F-012).

| Dimension | Score | Rationale |
|---|---|---|
| Security | **B** | RLS complete, admin-client use minimal & justified, cron guarded; but F-001/F-002/F-005 |
| Architecture | **A−** | Exemplary layering & conventions; per-page RSC usage could be richer |
| Performance (perceived) | **C** | Triple loading-state swap per navigation; no server prefetch (report 02) |
| Performance (runtime/memory) | **A−** | All effects/subscriptions cleaned up; minor races & cache misses only |
| Resilience | **D** | No error boundaries at all; lint pipeline broken |
| UX / platform parity | **B−** | Skeleton mismatch by design; dark-theme flash; iOS/Android divergences (report 03) |
| Code quality | **A** | Strict TS clean, no anti-pattern hits, consistent style |
| Dependencies | **B+** | Current and lean; one dead runtime dep; TS/ESLint majors available |

---

## 2. Architecture evaluation

### What the contract gets right (keep doing this)
- `src/lib/api/define-route.ts` and `define-action.ts` guarantee auth + zod validation + envelope on every entry point; `src/lib/api/result.ts:17-25` centralizes status codes; `toErrorResponse` (`src/lib/api/http.ts:27-41`) converts unknown errors to `INTERNAL` without leaking stacks.
- Client-generated UUIDs on create (`src/lib/schemas/chore.ts:7`) keep optimistic rows stable — the optimistic mutation pattern in `src/hooks/use-chores.ts` is textbook and replicated consistently across all 15 hooks.
- One realtime channel per couple (`src/components/providers/realtime-provider.tsx`) reconciling a centralized `queryKeys` registry (`src/lib/query/keys.ts`) is a sound sync design.
- Admin (service-role) client is imported in exactly three places, each genuinely impossible under RLS: invite-code lookup (`src/lib/services/couples.ts:56`), push/in-app notification fan-out (`src/lib/services/notifications.ts:70,148`), and the cron route (`src/app/api/cron/daily-notify/route.ts:20`).

### Architectural weaknesses
- **All data flows client-side.** Server Components render only static shells (`src/app/[locale]/(app)/chores/page.tsx` renders an `<h1>` and mounts a client component); every byte of data arrives via `useQuery` → `/api/*` after hydration. The server already has an authenticated Supabase client during the RSC render and could prefetch/stream the data (see F-021, report 02).
- **The `(app)/layout.tsx` gate does a 3-step sequential DB waterfall** (`getSession` → `getProfile` → `getCoupleMembers`, `src/app/[locale]/(app)/layout.tsx:24-31`) and `getProfile` is not `React.cache`-wrapped, so pages that also call it (e.g. home, `src/app/[locale]/(app)/page.tsx:18`) duplicate the query (F-022).
- **No error boundaries** (F-012): `Glob src/app/**/error.tsx` returns nothing, and there is no `global-error.tsx`. A single thrown error in any client component (e.g. `useCouple` outside provider throws — `src/components/providers/couple-provider.tsx:28`) or an RSC data failure white-screens the app. The bundled docs (`01-app/01-getting-started/10-error-handling.md`) prescribe `error.tsx` per segment.

---

## 3. Critical findings index (High severity across all reports)

| ID | Severity | Finding | Where |
|---|---|---|---|
| F-001 | **High** | Third user can join a couple; no member-count check | `src/lib/services/couples.ts:47-68` |
| F-012 | **High** | No `error.tsx`/`global-error.tsx` anywhere — app has zero error boundaries | `src/app/**` |
| F-006 | **High** | `bun run lint` crashes (`eslint-plugin-storybook` unresolved) and Next 16 removed build-time lint → **no linting runs at all** | `eslint.config.mjs:2` |
| F-020 | **High** | Triple loading-state swap on every navigation (root cause of sluggish transitions) | report 02 §1 |
| F-021 | **High** | No server prefetch/hydration for TanStack Query — data always paints after a client round-trip | report 02 §2 |
| F-040 | **High** | The single generic `(app)/loading.tsx` is shaped like the *home* page but shows for *every* route | report 03 §1 |

---

## 4. Security findings (full detail)

### F-001 · High — a couple can silently become a "throuple"
`joinCouple` (`src/lib/services/couples.ts:47-68`) looks up the couple by invite code with the service-role client and links the caller's profile with **no check on current member count**. The schema has no constraint either (`supabase/migrations/0001_init.sql:17-24` — `profiles.couple_id` is a plain FK).
**Impact:** anyone who obtains a (never-expiring) invite code joins an existing couple and, via RLS (`couple_id = current_couple_id()`), gains full read/write over all of the couple's data — notes, moods, expenses, photos of life. Downstream code assumes exactly two members: `partner = members.find((m) => m.id !== user.id)` (`src/app/[locale]/(app)/layout.tsx:33`) silently picks an arbitrary "partner", and `notifyPartner` fans out to *all* non-actor members (`src/lib/services/notifications.ts:81`).
**Fix direction:** count members inside `joinCouple` before linking (and/or a DB-level guard, e.g. trigger or partial unique index limiting two profiles per `couple_id`), plus the ability to rotate/expire the invite code.

### F-002 · Medium — no rate limiting on abuse-prone endpoints
`ErrorCode.RATE_LIMITED` exists (`src/lib/api/result.ts:10`) but is never thrown anywhere in `src`. Unthrottled surfaces:
- `joinCoupleAction` — invite-code guessing (4 random bytes = 8 hex chars; ~4.3 × 10⁹ space, but nothing slows an online enumeration).
- `/api/notes/nudge` (`sendNudge`, `src/lib/services/love-notes.ts:76-79`) and `/api/nudges` — each call triggers a real Web Push to the partner; a buggy or malicious client can push-bomb a device.
- `/api/push/test` — same amplification against one's own devices.

### F-005 · Medium — raw Postgres error strings leak to the client
The envelope protects against *unknown* errors, but services wrap Supabase failures as `new ApiError(ErrorCode.INTERNAL, error.message)` (e.g. `src/lib/services/chores.ts:18`, `src/lib/services/expenses.ts:24`, `src/lib/services/notifications.ts:202` — the pattern is repo-wide). `toErrorResponse` (`src/lib/api/http.ts:28-34`) passes `ApiError.message` straight through, so constraint names, column names, and PostgREST internals reach the browser.
**Fix direction:** log `error.message` server-side; return a generic message for `INTERNAL` (only whitelisted codes keep their message).

### F-003 · Low — client-controlled timestamp
`openLoveNote` persists a client-supplied `opened_at` (`src/lib/services/love-notes.ts:58-73`). Harmless today, but shared state should be stamped server-side (`new Date().toISOString()`).

### F-004 · Low — `assignee_id` not constrained to the couple
`createChoreSchema` accepts any UUID (`src/lib/schemas/chore.ts:9`); RLS validates `couple_id` but nothing checks the assignee is a member. FK to `profiles` prevents garbage, not cross-couple references.

### F-011 · Low — expense balance ignores currency
Expenses carry a per-row `currency` (default `EUR`, `src/lib/services/expenses.ts:49`), but `computeBalance` sums `amount_cents` across all rows regardless of currency. Two currencies in one ledger produce a meaningless balance and `settleUp` (`src/lib/services/expenses.ts:76-95`) records it.

### F-010 · Info — CSRF posture
Route handlers rely on Supabase auth cookies (SameSite=Lax) with no Origin check; Server Actions have Next's built-in origin validation. Acceptable for this threat model since all mutations are POST/PATCH/DELETE (Lax blocks cross-site sends), but worth a note if cookie settings ever change.

### Verified-good (no action)
- Cron endpoint refuses when `CRON_SECRET` is unset and requires the Bearer token (`src/app/api/cron/daily-notify/route.ts:14-18`).
- RLS enabled + policies on every table (`0001_init.sql:116-173`, and each feature migration 0003–0015); `current_couple_id()` is `SECURITY DEFINER` with pinned `search_path`.
- `push_subscriptions` scoped `user_id = auth.uid()`; a cross-user endpoint upsert is blocked by the USING clause.
- Secrets hygiene: `.env.example` correctly splits public/server-only; service-role key only read in the `server-only` module `src/lib/supabase/admin.ts`.
- `proxy.ts` follows the Next 16 convention and the Supabase-SSR guidance (cookie sync to request *and* response, `getUser()` touch — `src/lib/supabase/proxy.ts`).

---

## 5. Dependency & supply-chain review

From `package.json` + `bun outdated` (2026-07-09):

| Package | Status | Note |
|---|---|---|
| `next-themes@0.4.6` | **Unused — remove** (F-026) | Zero imports in `src`; theming is a bespoke `ColorThemeProvider` |
| `@tanstack/react-query-devtools` | Unused devDep | Zero imports; harmless, remove or actually mount it in dev |
| `typescript` 5.9.3 → 7.0.2 | Major available | Stay on 5.x for now; 7 needs a migration pass |
| `eslint` 9.39.4 → 10.6.0 | Major available | Blocked anyway until F-006 is fixed |
| `@types/node` ^20 | Pinned old | Fine for the deployed Node runtime; bump when platform bumps |
| `@supabase/supabase-js`, `supabase` CLI | Patch behind | Routine bump |
| `react`/`react-dom` 19.2.4 → 19.2.7 | Patch behind | Note: App Router actually uses React canary bundled with Next |

Structural notes:
- `"workspaces": ["storybook"]` + root `eslint.config.mjs` importing the storybook plugin is the source of the broken lint (F-006): the plugin is a dependency of the workspace, not the root, and is not resolvable from the root config.
- `ignoreScripts`/`trustedDependencies` for `sharp`/`unrs-resolver` is a reasonable bun supply-chain posture.
- All heavy UI deps (`lottie-react`, `canvas-confetti`, `motion`, `date-fns`, `tailwind-merge`) are genuinely used; `lottie-react` is correctly lazy-loaded (`src/components/features/pet/pet-avatar.tsx:9`).

---

## 6. Mechanical check results

| Check | Result |
|---|---|
| `bun run build` (Turbopack, prod) | ✅ Compiles clean in ~15 s; 59 static pages; **all 15 `(app)` routes dynamic (ƒ)**; only `/login` SSG. Next 16 no longer prints bundle sizes — measure with Lighthouse per the docs (`version-16.md` "Performance Improvements") |
| `bunx tsc --noEmit` | ✅ Zero errors (strict mode) |
| `bun run lint` | ❌ **Crashes**: `Cannot find package 'eslint-plugin-storybook' imported from eslint.config.mjs` (F-006) |
| `bun outdated` | 7 packages behind (table above) |
| Grep: `console.log/warn/debug` | ✅ None (only `console.error` in error paths) |
| Grep: `any` / `@ts-ignore` / `@ts-expect-error` / `dangerouslySetInnerHTML` | ✅ None |
| Grep: raw `<img>` | 1 justified use (`src/app/[locale]/loading.tsx:5`, eslint-disabled) |
| Grep: relative `../` imports | ✅ None (aliased `@/*` throughout) |
| Grep: hard-coded HTTP status numbers in routes | ✅ None outside `result.ts`/cron |
| i18n key parity fr ↔ zh | ✅ 288 = 288, zero drift |
| Hard-coded UI strings | ⚠️ 5 English `aria-label`s bypass next-intl (F-049, report 03 §5) + French copy hard-coded in `/api/push/test` payload |

### Additional code-quality findings
- **F-007 · Low** — `markAllNotificationsRead` returns `count ?? 0` but never requests `{ count: "exact" }`, so `updated` is always `0` (`src/lib/services/notifications.ts:222-233`).
- **F-008 · Low** — read-modify-write races on shared counters: `settleUp` can double-insert a settlement under concurrency (`src/lib/services/expenses.ts:76-95`); treats updates in `spendTreats`/`awardTreats`/`rewardFromChore` (`src/lib/services/pets.ts:310-360`) can lose increments. Two-user scale makes this rare, not impossible (both partners acting simultaneously is the app's whole premise).
- **F-009 · Low** — `care()` inserts the `pet_actions` row *before* validating (`src/lib/services/pets.ts:183-199`), so a rejected cuddle (`CONFLICT "Already cuddled today"`) leaves an orphan action row behind, and the treat-cost check happens before insert but the meters check after.
- **F-013 · Low** — `useColorTheme` silently no-ops outside its provider (`src/components/providers/color-theme-provider.tsx:63-72`) while `useCouple` throws (`couple-provider.tsx:28`) — inconsistent failure philosophy; the throw is only safe once error boundaries exist (F-012).
