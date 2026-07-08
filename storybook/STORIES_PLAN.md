# Storybook Stories — Implementation Plan

Living plan for adding simple-but-useful Storybook stories for **every UI component**
of the app, including feature components. Updated at the end of each phase.

Legend: ✅ done · 🚧 in progress · ⬜ pending

---

## How stories are wired (the foundation)

- **Tailwind v4** is processed via `storybook/postcss.config.mjs` (`@tailwindcss/postcss`).
- `preview.tsx` decorators: `withTheme` (sets `data-color-theme`, mirrors fonts) → `withAppProviders`.
- `withAppProviders` (`storybook/src/mocks/providers.tsx`) wraps every story in the
  app-shell providers feature components expect:
  - `NextIntlClientProvider` — loads `src/i18n/messages/fr.json`, locale `fr`.
  - `QueryClientProvider` — one shared mock `QueryClient` (retry off).
  - `CoupleProvider` — static `me`/`partner` (`Profile` mocks).
  - `ColorThemeProvider` — `initialTheme="peach"`.
- `RealtimeProvider` is **not** mocked: it is only mounted in the app shell, and
  `useOnlineUsers()` safely falls back to an empty `Set`.
- The `@` alias resolves to the **app** `src` (`../../src`), and `@/i18n/navigation`
  is aliased to a plain-anchor mock (`storybook/.storybook/src/mocks/navigation.tsx`).

### Mocking data hooks (for container components)
Feature "container" components read data from `src/hooks/use-*.ts`. In a story file we
mock the hook module so it returns static fixtures + a `mutate: fn()` (from
`storybook/test`), e.g.:

```ts
import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusCard } from "@/components/features/status/status-card";

vi.mock("@/hooks/use-statuses", () => ({
  useStatuses: () => ({ data: [{ user_id: "me-storybook", state: "free" }] }),
  useSetStatus: () => ({ mutate: fn() }),
}));

const meta = { title: "Features/Status/StatusCard", component: StatusCard } satisfies Meta<typeof StatusCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Free: Story = {};
export const Busy: Story = { /* override the mock with vi.mocked */ };
```

`vi` is available from `storybook/test` (Vitest under the hood).

---

## Phase 1 — Shared infrastructure ✅ (committed)

`storybook/src/mocks/providers.tsx` + `preview.tsx` decorator. Verified: `typecheck`
and `build-storybook` pass.

---

## Phase 2 — UI primitives ✅ (committed)

All seven already had basic stories (created earlier). This phase added useful variations:
Button (variant × size **Matrix** + **IconOnly**), Card (**WithAction** composing
CardTitle/Description/Button), SegmentedToggle (**TwoOptions** free/busy, **FourOptions**).
EmptyState / HubCard / Sheet / Switch already had solid coverage. Verified: typecheck + build pass.

All seven already have basic stories (created earlier). This phase = verify they render
under the new providers and add a few useful variations.

| Component | File | Stories to add |
|-----------|------|----------------|
| Button | `ui/button.tsx` | variants × sizes matrix, `icon` only, disabled, `asChild` link |
| Card | `ui/card.tsx` | `CardTitle`/`CardDescription` full set, nested grid |
| EmptyState | `ui/empty-state.tsx` | default + `action` variant |
| HubCard | `ui/hub-card.tsx` | resting + `disabled` |
| SegmentedToggle | `ui/segmented-toggle.tsx` | 2/3/4 options, controlled value |
| Sheet | `ui/sheet.tsx` | open (default) + trigger button |
| Switch | `ui/switch.tsx` | on/off, disabled |

---

## Phase 3 — Presentational feature components (pass mock props) ⬜

These take explicit props, so stories just feed mock data.

- **moods** — `mood-picker.tsx` (all emoji options), `mood-timeline.tsx` (list of entries)
- **notes** — `floating-hearts.tsx` (animation)
- **notifications** — `notification-item.tsx` (read/unread), `notification-glyph.tsx` (kinds)
- **pet** — `pet-avatar.tsx` (emoji/color), `pet-meters.tsx` (values), `pet-actions.tsx`
- **nudge** — `nudge-buttons.tsx` (mock `use-nudge` mutate)
- **profile** — `theme-color-picker.tsx` (all 6 themes)
- **coupons** — `coupon-card.tsx` (minted + redeemed variants)
- **bucket** — `bucket-item.tsx`
- **chores** — `chore-card.tsx`
- **grocery** — `grocery-item.tsx` (checked/unchecked)
- **expenses** — `balance-card.tsx`
- **dates** — `countdown-card.tsx` (future date)
- **meals** — `meal-slot.tsx`
- **pet** — `pet-memories.tsx`

## Phase 4 — Container feature components (mock hooks) ⬜

These read from `src/hooks/*`; mock the matching hook(s) per domain.

| Domain | Components | Hook(s) to mock |
|--------|-----------|-----------------|
| auth | `login-form.tsx` | (auth) — empty + error states |
| bucket | `bucket-list.tsx`, `add-bucket.tsx`, `spin-jar.tsx` | `use-bucket` |
| chores | `chore-list.tsx`, `add-chore.tsx` | `use-chores` |
| coupons | `coupons-board.tsx`, `mint-coupon.tsx` | `use-coupons` |
| dates | `countdown-list.tsx`, `add-date.tsx` | `use-special-dates` |
| expenses | `expenses-board.tsx`, `add-expense.tsx` | `use-expenses` |
| grocery | `grocery-list.tsx`, `add-grocery.tsx` | `use-grocery` |
| meals | `week-planner.tsx`, `meal-editor.tsx` | `use-meals` |
| moods | — (presentational, see P3) | `use-moods` if needed |
| notes | `notes-wall.tsx`, `notes-board.tsx`, `note-composer.tsx` | `use-love-notes` |
| notifications | `notification-list.tsx`, `notification-bell.tsx`, `notification-panel.tsx`, `notifications-card.tsx` | `use-notifications` |
| nudge | — (presentational, see P3) | `use-nudge` |
| onboarding | `onboarding.tsx` | (router/profile) — step 1 + final |
| pet | `pet-adopt.tsx`, `treats-card.tsx`, `pet-widget.tsx`, `pet-screen.tsx` | `use-pet` |
| profile | `couple-name-editor.tsx`, `profile-editor.tsx` | (couple/mutations) |
| question | `question-board.tsx` | `use-question` |
| status | `status-card.tsx` | `use-statuses` + `use-set-status` |

## Phase 5 — nav ⬜

- `bottom-nav.tsx` — wrap with mock couple + router; default + active route
- `locale-switcher.tsx` — mock `next-intl` locale

---

## Skipped (no visual UI)

- `providers/*` — become the decorator infra, not stories.
- `pwa/service-worker-register.tsx` — side-effect only.
- `features/*/use-*-realtime.ts` — hooks, not components.

---

## Progress tracker

- [x] Phase 1 — Shared infrastructure
- [x] Phase 2 — UI primitives
- [ ] Phase 3 — Presentational feature components
- [ ] Phase 4 — Container feature components
- [ ] Phase 5 — nav
