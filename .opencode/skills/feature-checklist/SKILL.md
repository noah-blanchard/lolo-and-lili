---
name: feature-checklist
description: The 12-step checklist for adding a new feature to the lolo-and-lili codebase
---

## Adding a New Feature — Complete Checklist

Follow these steps in order. Skipping steps causes bugs.

### 1. Database Migration (if needed)
Create `supabase/migrations/NNNN_<name>.sql`:
- Table with `couple_id uuid references public.couples(id) not null`
- RLS policies scoping to `couple_id` via `current_couple_id()`
- Standard pattern: `create policy <table>_all on public.<table> for all using (couple_id = public.current_couple_id()) with check (couple_id = public.current_couple_id())`
- Run `bun run gen:types` to regenerate TypeScript types

### 2. Zod Schema
Create `src/lib/schemas/<feature>.ts`:
- `export const create<Entity>Schema = z.object({...})`
- `export type Create<Entity>Input = z.infer<typeof create<Entity>Schema>`
- Client-generated UUIDs: `z.string().uuid()`
- Strings: `.trim().min(1).max(N)`
- Optionals: `.nullish()`

### 3. Service
Create `src/lib/services/<feature>.ts`:
- `export async function <verb>(supabase: DB, user: User, input: Input)`
- Use `requireCoupleId(supabase, user)` for couple scoping
- Throw `ApiError` or `fail.*` on error — never return null
- Check Supabase errors: `if (error) throw new ApiError(ErrorCode.INTERNAL, error.message)`

### 4. API / Server Action
Create `src/app/api/<feature>/route.ts` or `src/app/actions/<feature>.ts`:
- Use `defineRoute` or `defineAction`
- Pass zod schema as `input`
- Handler is thin glue — no business logic here

### 5. Query Keys
Add to `src/lib/query/keys.ts`:
- `queryKeys.<feature>(): ["<feature>"] as const`
- `queryKeys.<entity>(id: string): ["<feature>", id] as const`

### 6. Hooks
Create `src/hooks/use-<feature>.ts`:
- `"use client"` at top
- Query: `useQuery({ queryKey: queryKeys.<feature>(), queryFn: () => apiFetch<T>("/api/<feature>") })`
- Mutation: `useMutation` with optimistic pattern (cancel -> snapshot -> set -> rollback -> invalidate)

### 7. Realtime (if live sync needed)
Register in `src/components/providers/realtime-provider.tsx`:
- Add `{ event: "*", schema: "public", table: "<table>", filter: "couple_id=eq.${coupleId}" }`
- Invalidate corresponding `queryKeys.<feature>()`

### 8. UI Components
Create `src/components/features/<feature>/*.tsx`:
- `"use client"` components consuming hooks
- Reuse `src/components/ui/` primitives
- `cn()` for classes, `motion/react` for animation
- `useTranslations("<feature>")` for all copy

### 9. Page
Create `src/app/[locale]/(app)/<feature>/page.tsx`:
- Async Server Component
- `setRequestLocale(locale)` for next-intl
- `getTranslations("<feature>")` for server copy
- Render the client feature component

### 10. i18n
Add keys to both:
- `src/i18n/messages/fr.json`
- `src/i18n/messages/zh.json`

### 11. Notifications (optional)
If the feature notifies the partner:
- Add `NotifyKey` in `src/lib/notifications/messages.ts`
- Call `notifyPartner(supabase, { key, title, body, url, target })` from service
- In-app row is automatically persisted alongside web push

### 12. Verify
- `bun run lint`
- `bun run build`
