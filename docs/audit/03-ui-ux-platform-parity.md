# 03 — UI/UX & Platform Parity (iOS vs Android)

Companion to [01-global-audit-summary.md](./01-global-audit-summary.md) and [02-deep-dive-performance-memory.md](./02-deep-dive-performance-memory.md). Finding IDs continue the shared `F-###` registry.

---

## 1. Skeleton-vs-reality matrix (F-040 · High)

There are **two generic route-level loading states** and **13 per-feature inline skeletons**. The mismatch complaint comes from the route-level one: `src/app/[locale]/(app)/loading.tsx` is shaped like the **home** page (status card with two person-rows + button, a 3×2 grid card, a small pet row) and is shown for **every** `(app)` route during the RSC fetch, after which the real page mounts and shows a *second*, differently-shaped feature skeleton (see report 02 §1).

| Route | What `(app)/loading.tsx` shows | What actually loads | Mismatch |
|---|---|---|---|
| `/` (home) | status + grid + pet skeleton | StatusCard, NudgeButtons, PetWidget, TreatsCard | **Closest match** — but NudgeButtons/TreatsCard shapes still differ |
| `/chores` | home-shaped skeleton | `<h1>` + AddChore button + 3-row list skeleton (`chore-list.tsx:25-33`) | High — grid card has no counterpart |
| `/notes` | home-shaped skeleton | notes wall/grid masonry | High |
| `/coupons` | home-shaped skeleton | ticket-shaped coupon board | High |
| `/meals` | home-shaped skeleton | week planner table | High |
| `/expenses` | home-shaped skeleton | balance card + expense rows | Medium |
| `/maison`, `/nous` (hubs) | home-shaped skeleton | header + 2×2 `HubCard` grid, **no data fetch at all** | High — these pages are static-content; they flash a data skeleton for content that needs none |
| `/pet` | home-shaped skeleton | full-screen pet scene | High |
| `/profile`, `/dates`, `/question`, `/bucket`, `/grocery` | home-shaped skeleton | various | Medium–High |

**Fix direction (two options, compoundable):**
1. Per-route `loading.tsx` files matching each page's real geometry (cheap, mechanical).
2. Server prefetch (F-021) so the second skeleton phase disappears and the route-level skeleton becomes the only one — then make *it* per-route.

Also: the root `src/app/[locale]/loading.tsx` (full-screen pulsing icon) renders for hard loads/auth pages — a completely different loading language from the in-app skeletons. Acceptable, but it means users see three distinct loading aesthetics in one session (icon pulse → home skeleton → feature skeleton).

Related: `src/components/ui/spinner.tsx` exists as a fourth loading vocabulary (used in buttons). Consider a written rule for which loading state is used where.

---

## 2. iOS-specific issues

### F-042 · Medium — status bar / splash mismatch for dark themes
- `viewport.themeColor` is hard-coded light cream `#fff7f0` (`src/app/[locale]/layout.tsx:33`).
- The manifest's `background_color`/`theme_color` are the same cream (`src/app/manifest.ts:13-14`).
- But two of the six user themes are **dark** (`midnight`, `cocoa` — `src/app/globals.css:117-165`).
A midnight-theme user on iOS standalone gets a cream status bar and cream splash over a `#161a2e` app. Android's toolbar/splash equally mismatch. Fix: set `themeColor` dynamically (per-theme `<meta name="theme-color">` client-side update in `ColorThemeProvider.applyTheme`) and pick a neutral splash.

### F-030 · Medium — theme flash on cold load (both platforms, most visible on iOS standalone)
`ColorThemeProvider` applies `data-color-theme` **after hydration** in `useEffect` (`color-theme-provider.tsx:47-49`), yet `initialTheme` is already known server-side (`(app)/layout.tsx:37`). The `<html>` element (`[locale]/layout.tsx:54`) never gets the attribute SSR'd, so dark-theme users see the default peach palette until hydration completes — exactly the "flash before hydration" case the bundled docs cover (`01-app/02-guides/preventing-flash-before-hydration.md`). Fix: thread the theme up to the root layout (cookie or DB read) and render `<html data-color-theme={...}>` server-side; keep the client setter for live switching.

### F-041 · Medium — `maximumScale: 1` (a11y + parity divergence)
`src/app/[locale]/layout.tsx:36` sets `maximumScale: 1`. iOS Safari **ignores** it (users can still pinch-zoom); Android Chrome **honors** it (zoom blocked). Result: an accessibility failure on Android only — the definition of a parity bug. Remove it (or set `userScalable` deliberately and document why).

### F-043 · Medium — notification tap doesn't deep-link when the app is open
`public/sw.js:84-93`: `notificationclick` finds any existing window and calls `focus()` **without navigating** to `event.notification.data.url`. The `url` is only honored via `openWindow` when no window exists. Tapping "Chore done ✅" while the PWA is backgrounded focuses whatever page was last open. Fix: `existing.navigate(target).then(w => w.focus())` (with fallback), or postMessage to the client and route client-side. (Also: `clients.find((c) => "focus" in c)` picks an arbitrary tab if several are open.)

### F-046 · Low — sheet height uses `vh` on iOS
`src/components/ui/sheet.tsx:34` caps drawers at `max-h-[80vh]`. In iOS Safari (browser mode) `vh` includes the collapsed URL bar, so 80vh can exceed the visible viewport with the keyboard open; `80dvh` tracks the dynamic viewport. Low impact in standalone mode (no URL bar), real in-browser.

### F-047 · Info — haptics are Android-only
`vibrate()` (`src/lib/feedback.ts:34-41`) uses `navigator.vibrate`, which iOS has never implemented — silently no-ops. Pet interactions feel different across platforms by design limitation; nothing to fix in code, but worth knowing it's not a bug when iOS users report "no vibration".

### Verified-good on iOS
- Web-push install gating is handled thoroughly: `iosNeedsInstall = isIOS && !isStandalone` with iPadOS-as-Mac sniffing (`src/hooks/use-push.ts:25-41,144`).
- Safe areas: `env(safe-area-inset-*)` padding on body (`globals.css:228-229`), `pb-safe` utility for the floating nav (`bottom-nav.tsx:37`), bell pinned below the notch (`notification-bell.tsx:21`).
- `min-h-dvh` (not `100vh`) is used in the shells (`(app)/layout.tsx:39`, `(auth)/layout.tsx:14`).
- `viewportFit: "cover"`, `apple-touch-icon.png`, raster PNG icons for iOS in the manifest (`manifest.ts:29-41`), `appleWebApp` metadata (`[locale]/layout.tsx:28`).
- `-webkit-tap-highlight-color: transparent` + `overscroll-behavior-y: none` (`globals.css:219,232`).

---

## 3. Android/Chrome-specific issues

- F-041 (zoom lock) — bites Android only, see above.
- Maskable icon provided as SVG only (`icon-maskable.svg`, `manifest.ts:23-27`); the PNGs lack `purpose: "maskable"`. Chromium accepts SVG maskable icons, but some launchers fall back to the non-maskable PNG and draw the white-box shape. Low; supply a maskable 512 PNG.
- Push payload icon/badge are SVG (`sw.js:77-78`); Android notification `badge` should be a monochrome raster for correct rendering — currently the coloured icon is used for both. Low/cosmetic.

---

## 4. Shared PWA / installability audit

- **F-044 · Low — stale duplicate manifest.** `public/site.webmanifest` (empty `name`, white colors) coexists with the real `src/app/manifest.ts` → `/manifest.webmanifest`. Nothing references it, but it's one crawler/copy-paste away from being picked up. Delete it.
- **F-045 · Low — manifest not localized & English description.** `manifest.ts:8` ships the English description (the French original is commented out at line 7) in an app whose default locale is fr. `MetadataRoute.Manifest` is static per-build here; at minimum restore the fr description, ideally serve per-locale manifests.
- **F-027** (report 02 §5) — SW registration race also affects installability signals.
- `sw.js` navigations are network-first with offline fallback to `offline.html` (`sw.js:35-42`) — correct choice for an auth-gated app. `Cache-Control: no-store` + `updateViaCache: "none"` on `/sw.js` (`next.config.ts:11-16`, `service-worker-register.tsx:19`) makes updates ship fast. ✅
- The push fallback body is `"💕"` with title "Lolo & Lili" (`sw.js:67`) — fine; but `/api/push/test` hard-codes French copy (`push/test/route.ts:12-14`) regardless of the device locale saved in `push_subscriptions.locale`. Low (F-049 adjunct).

---

## 5. i18n & copy parity

- ✅ fr ↔ zh key parity is perfect: 288 keys each, zero drift (verified by flattening both JSON files).
- ✅ `date-fns` locales imported correctly for both languages (`src/lib/dates.ts:1-3`).
- **F-049 · Low — 5 hard-coded English `aria-label`s** bypass next-intl, breaking the "never hard-code UI copy" rule for screen-reader users:
  - `src/components/ui/spinner.tsx:27` (`"Loading"`)
  - `src/components/features/pet/pet-screen.tsx:95` (`"mute"`)
  - `src/components/features/chores/chore-card.tsx:46` (`"toggle"`), `:67` (`"delete"`)
  - `src/components/features/notifications/notification-bell.tsx:18` (`"Notifications"`)
- `notifyPartner` localizes by the **first** push subscription's locale (`notifications.ts:93`) — a user with an fr phone and zh tablet gets one arbitrary language for both push and the persisted in-app row. Info; per-device localization for pushes (per-sub loop already exists) would fix the push half.

---

## 6. Misc UX findings

- **F-048 · Low** — `(auth)/layout.tsx` never redirects authenticated users away from `/login`; a signed-in user opening `/fr/login` sees the OTP form again. Mirror the `(app)` gate: `if (user) redirect("/")`.
- **F-012** (report 01 §4) has UX impact worth restating here: with no `error.tsx`, a failed query or render error during navigation replaces the app — including the bottom nav — with the framework error screen. On a PWA this reads as a crash.
- The exit-animation footgun documented in `docs/UI_ANIMATION_GOTCHAS.md` is respected where it matters (`note-lightbox.tsx` per the doc); no new violations found in the components reviewed. The one *inert* `AnimatePresence` is `PageTransition` (report 02 §1 step 5).
- Login form UX is solid (OTP autocomplete, `inputMode="numeric"`, resend cooldown, invalid-state styling — `login-form.tsx:148-160`).
