---
name: supabase-conventions
description: Supabase client selection, RLS patterns, couple scoping, type safety, and the admin client boundary
---

## What This Skill Covers

How Supabase is used throughout the codebase: three clients, RLS enforcement,
couple scoping, and type generation.

## Three Clients

| Client | File | When to Use |
|--------|------|-------------|
| Browser | `src/lib/supabase/client.ts` | Client Components — Realtime, client queries |
| Server | `src/lib/supabase/server.ts` | Server Components, Route Handlers, Server Actions |
| Admin | `src/lib/supabase/admin.ts` | Server-only, bypasses RLS — invite-code lookup, notification inserts |

**Admin is guarded by `import "server-only"`** — importing into a Client Component causes a build error.

## Couple Scoping (Security-Critical)

Every user belongs to a couple (`couple_id` on `profiles`). All data is couple-scoped.

```ts
import { requireCoupleId } from "@/lib/services/couples";

export async function listChores(supabase: DB, user: User) {
  const coupleId = await requireCoupleId(supabase, user);
  // RLS also enforces this, but the explicit filter ensures query plans use the index
  const { data, error } = await supabase
    .from("chores")
    .select("*")
    .eq("couple_id", coupleId);
  // ...
}
```

## RLS Patterns

### Core Function
```sql
create or replace function public.current_couple_id()
returns uuid language sql stable security definer
as $$ select couple_id from public.profiles where id = auth.uid() $$;
```

### Couple-Scoped Table
```sql
create policy <table>_all on public.<table>
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());
```

### Self + Partner (profiles)
```sql
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or couple_id = public.current_couple_id());
```

### Cross-Table (chore_completions via parent)
```sql
create policy chore_completions_all on public.chore_completions
  for all using (exists (
    select 1 from public.chores c where c.id = chore_id
    and c.couple_id = public.current_couple_id()
  ));
```

## Type Safety

- Generated types: `src/lib/supabase/database.types.ts` — regenerated via `bun run gen:types`
- App types: `src/lib/supabase/types.ts` — manual overlays + convenience aliases
- Import types: `import type { Profile, Couple, ... } from "@/lib/supabase/types"`
- All clients typed with `Database` generic: `SupabaseClient<Database>`

## Error Handling

```ts
const { data, error } = await supabase.from("chores").select("*");
if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
```

Always check `error` immediately after Supabase queries. Never silently swallow errors.

## Realtime

- One channel per couple: `couple:${coupleId}`
- JWT bootstrap required for RLS: `supabase.realtime.setAuth(session.access_token)`
- Postgres Changes with `couple_id` filter
- Invalidates TanStack Query cache via centralized `queryKeys`
