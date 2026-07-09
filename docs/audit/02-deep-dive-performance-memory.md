# 02 — Deep Dive: Performance & Memory

Companion to [01-global-audit-summary.md](./01-global-audit-summary.md). Finding IDs continue the shared `F-###` registry.

---

## 1. Root cause: why page switching feels sluggish (F-020 · High)

Switching tabs today produces **up to three distinct visual states before real content**, plus an animation restart. The chain, verified file by file:

### Step 1 — every route is dynamic, so every navigation is a server round-trip
`next build` marks all 15 `(app)` pages `ƒ (Dynamic)`. They are dynamic because the shared `(app)/layout.tsx` reads cookies via `getSession()` (`src/app/[locale]/(app)/layout.tsx:24`). On each navigation the router must fetch the new page's RSC payload from the server before it can render anything except the loading boundary. Next 16's prefetching (see bundled docs `01-app/02-guides/prefetching.md`) can prefetch only the *static shell* of a dynamic route — i.e. exactly the `loading.tsx` skeleton — so the skeleton is guaranteed to appear even on instant taps.

### Step 2 — the loading boundary is a generic, home-shaped skeleton
`src/app/[locale]/(app)/loading.tsx` renders a status-card + 3×2 grid + pet-row skeleton — the *home* page's shape — for **every** route (chores, coupons, notes, meals…). This is the skeleton-mismatch complaint; per-route detail in report 03 §1.

### Step 3 — the page arrives… empty, and a *second* skeleton appears
Pages are static shells: `chores/page.tsx` renders `<h1>` + `<ChoreList />`; `ChoreList` mounts, `useChores()` starts a **client-side** fetch to `/api/chores`, and renders its own, differently-shaped skeleton (`src/components/features/chores/chore-list.tsx:25-33`). So the user sees: home-shaped skeleton → page header + list-shaped skeleton → data. Two skeleton swaps, both with different geometry.

### Step 4 — the template re-runs an entry animation on every navigation
`src/app/[locale]/(app)/template.tsx` remounts per navigation by design (confirmed against bundled docs `03-file-conventions/template.md`) and plays a `y: 10 → 0` spring fade on the whole page. The pop-in makes each skeleton swap *more* noticeable because the content shifts vertically while loading states change.

### Step 5 — the `PageTransition` wrapper is inert (dead code, plus a false promise)
`src/components/ui/page-transition.tsx` wraps `{children}` in `AnimatePresence mode="wait"` from the layout (`(app)/layout.tsx:42`). `AnimatePresence` only animates **direct motion children keyed per route**; here its direct child is Next's stable segment tree, so:
- no exit animation ever plays — the `exit={{ opacity: 0, y: -4 }}` in `template.tsx:17` is unreachable;
- `mode="wait"` never engages.
The component contributes nothing except an extra client boundary. It should be removed or replaced with a real route-keyed transition (or React `ViewTransition`, which the bundled docs list as the Next 16-era approach — `01-app/02-guides/view-transitions.md`).

**Net effect:** even on a warm connection, each tab switch = RSC round-trip + generic skeleton + entry animation + feature skeleton + data pop-in. Each stage is individually "correct"; combined they read as sluggish.

---

## 2. No server prefetch/hydration of query data (F-021 · High)

Every feature page already runs on the server with an authenticated Supabase client (the layout created one), yet **all data is fetched client-side after hydration** — `src/hooks/use-*.ts` (15 hooks) → `apiFetch` → `/api/*` → `defineRoute` → the same Supabase queries the RSC could have run directly.

Cost per navigation: RSC round-trip (renders nothing data-bearing) **+** hydration **+** a second HTTP round-trip through a route handler that re-authenticates (`supabase.auth.getUser()` in `define-route.ts:38-41`) before the first row is fetched.

**Fix direction (established TanStack SSR pattern; bundled docs `01-app/01-getting-started/06-fetching-data.md`):** in each page, `prefetchQuery` with the same `queryKeys` + service call server-side and wrap in `HydrationBoundary`; the client `useQuery` then hydrates instantly with data and revalidates in the background. The per-feature skeletons become an offline/edge case rather than the every-navigation norm. Applies to all 15 pages; the highest-traffic ones (home, chores, notes, pet) first.

---

## 3. Server request waterfall & duplicate queries (F-022 · Medium)

Per dynamic request, `(app)/layout.tsx:24-31` awaits sequentially:
1. `getSession()` → `auth.getUser()` (network call to Supabase Auth)
2. `getProfile()` → `profiles` select
3. `getCoupleMembers()` → second `profiles` select (fetches *both* members — a superset of step 2!)

Then the home page (`(app)/page.tsx:17-28`) calls `getSession()` (cached ✅), `getProfile()` (**not cached — duplicate query**, `src/lib/auth.ts:18` lacks the `cache()` wrapper that `getSession` has at line 9), and a `couples` select.

Fixes: wrap `getProfile` in `React.cache`; derive `me` from `getCoupleMembers` output instead of a separate `getProfile` call (one query instead of two); fetch the couple name with a join in the same query on the home page. Realistic saving: 2–3 DB round-trips per request on every dynamic navigation and every `router.refresh()`.

Also note the proxy adds its own `auth.getUser()` per matched request (`src/lib/supabase/proxy.ts:40`) — required by Supabase SSR guidance, but it means an authenticated navigation performs at minimum two auth checks (proxy + layout) before any page data. Unavoidable with this stack; worth knowing when reading traces.

---

## 4. Realtime & TanStack Query efficiency

### F-023 · Medium — `profiles` change triggers a full `router.refresh()`
`realtime-provider.tsx:88-92`: any change to either profile row re-renders **every Server Component** (re-running the layout's DB waterfall of §3) instead of invalidating a scoped query. A partner changing their accent color re-fetches the entire app. Fix: split profile data into a query (`queryKeys.profile()` already exists in `keys.ts:18` but is unused!) or narrow the refresh.

### F-024 · Low — `chore_completions` listener missing the couple filter
Every other `postgres_changes` listener filters `couple_id=eq.${coupleId}`; `chore_completions` doesn't (`realtime-provider.tsx:84-87` — the table has no `couple_id` column, it scopes via the parent chore). RLS on the realtime stream (the provider does `realtime.setAuth(session.access_token)` at line 62) prevents cross-couple *delivery*, so this is consistency/efficiency, not a leak. If desired, denormalize `couple_id` onto `chore_completions` and filter.

### Verified-good
- `staleTime: 30_000` + `refetchOnWindowFocus: false` + realtime invalidation (`query-provider.tsx:7-15`) is a sane, storm-free cache config. Each Postgres change invalidates exactly one key; only screens actively observing that key refetch.
- Invalidation fan-out is 1:1 (no cascade). `pets` and `pet_actions` both map to `queryKeys.pet()` — a care action produces two events → two invalidations of the same key; TanStack dedupes the refetch in the same tick. Acceptable.

---

## 5. Memory-leak inventory

Every `useEffect` with a subscription/timer/listener in the codebase was reviewed. **Verdict: no leaks found.** (Recent commits `29bfd2f`/`ffa04ed` already addressed this area; nothing regressed.)

| Site | Resource | Cleanup | Verdict |
|---|---|---|---|
| `realtime-provider.tsx:48-193` | couple channel (19 listeners) + presence | `cancelled` flag + `removeChannel` in cleanup; guards post-unmount `setAuth`/`track` | ✅ |
| `pet/use-pet-realtime.ts:19-41` | `petcare:` channel | `removeChannel` | ✅ (callback via ref — no stale closure) |
| `notes/use-love-realtime.ts:31-48` | `love:` broadcast channel | `removeChannel` + ref null-out | ✅ |
| `auth/login-form.tsx:29-33` | 1 s countdown interval | `clearInterval` | ✅ (recreated every tick because `cooldown` is a dep — wasteful but leak-free, F-029 · Info) |
| `pwa/service-worker-register.tsx:11-26` | `load` listener | removed | ✅ (but see F-027 below — the opposite problem) |
| `pet-avatar.tsx:26-41` | fetch + state | `alive` flag | ✅ |
| `lib/feedback.ts:7` | module-level `HTMLAudioElement` cache | n/a (intentional, bounded by sound count) | ✅ |

### F-027 · Low — service worker may never register (race, not leak)
`ServiceWorkerRegister` adds a `load` listener inside `useEffect`. If hydration completes **after** `window.load` has already fired (slow JS, fast page — common on repeat visits with cached images), the listener never fires and the SW silently never registers → no offline shell, no push until `usePush.subscribe()` happens to run its fallback `register` (`use-push.ts:100`). Fix: `if (document.readyState === "complete") onLoad(); else addEventListener(...)`.

---

## 6. Bundle & asset weight

Next 16 removed size metrics from build output (bundled docs, `version-16.md` "Performance Improvements"); observations below are from import analysis.

- ✅ `lottie-react` — the heaviest UI dep — is loaded via `next/dynamic(..., { ssr: false })` (`pet-avatar.tsx:9`), so it only ships on pet-rendering screens. Pet Lottie JSONs are fetched at runtime.
- **F-025 · Low** — those `/lottie/pet/*.json` fetches are uncached at every layer: `useLottie` re-fetches per state change and remount (`pet-avatar.tsx:26-41`, no TanStack cache), and `public/sw.js:44-49` SWR-caches only `/_next/static/`, `/icon*`, and the manifest — not `/lottie/**` or `/sounds/**`. Add both to the SW route list and/or cache the JSON in the query cache keyed by slot.
- `motion` is imported by ~30 client components; it is part of the product's identity ("cute/bouncy" per repo rules) and tree-shakes reasonably — no action, but it is the floor of the client bundle.
- `canvas-confetti`, `date-fns` (with only `fr`/`zh-CN` locales imported — good), `lucide-react` (named per-icon imports — tree-shakeable) are all fine.
- **F-026 · Low** — `next-themes` is a *runtime* dependency with zero imports; remove it. `@tanstack/react-query-devtools` is an unused devDep (remove or mount it behind `NODE_ENV`).

---

## 7. Client-state & re-render notes

- Providers are correctly ordered and mounted once in the `(app)` shell; context values are stable (`CoupleProvider` receives a server-constructed object per render of the layout — fine since the layout re-renders only on refresh).
- `RealtimeProvider` presence updates (`setOnline`/`setLastSeen`, `realtime-provider.tsx:163-181`) re-render its subtree on every presence sync; consumers are only `StatusCard`. Contained.
- `useUnreadCount()` (`use-notifications.ts:15-18`) subscribes `NotificationBell` — mounted in the layout — to the *entire* notifications list; any notification change re-renders the bell. Cheap today at ≤100 rows (`listNotifications` cap); fine.
- The i18n message bundle (288 keys × 2 locales) loads in full per locale (`src/i18n/request.ts:14`); at this size splitting isn't worth it.
