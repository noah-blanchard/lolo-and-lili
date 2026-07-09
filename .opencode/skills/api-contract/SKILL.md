---
name: api-contract
description: The server request contract — defineRoute, defineAction, zod validation, result envelope, fail.* helpers, and the schema→service→route layering
---

## What This Skill Covers

The API contract is the backbone of this codebase. Every server entry point MUST
use these building blocks.

## The Four Building Blocks

### defineRoute (Route Handlers)
File: `src/lib/api/define-route.ts`

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

Injects: `{ req, input, supabase, user, params }`. Returns `{ ok: true, data }` envelope.

### defineAction (Server Actions)
File: `src/lib/api/define-action.ts`

```ts
"use server";
import { defineAction } from "@/lib/api/define-action";
import { renameCoupleSchema } from "@/lib/schemas/profile";

export const renameCoupleAction = defineAction(
  renameCoupleSchema,
  async ({ input, supabase, user }) => renameCouple(supabase, user, input.name),
);
```

Returns `ApiResult<T>` directly (not NextResponse).

### result.ts — The Envelope

```ts
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiErrorShape };
// ApiErrorShape: { code: ErrorCode, message: string, details?: unknown }
```

Error codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL`.

Throw helpers: `fail.unauthorized()`, `fail.forbidden()`, `fail.notFound()`, `fail.conflict()`.

Validation: `validationError(zodError)` → 422 with flattened field errors.

### http.ts — Response Serialization

`jsonOk(data)` → `{ ok: true, data }` NextResponse. `jsonError(error)` → `{ ok: false, error }`. `toErrorResponse(unknown)` → catches and converts.

## Layering Rule

```
src/lib/schemas/<feature>.ts    → zod input schema, type inference
src/lib/services/<feature>.ts   → business logic, throws ApiError/fail.*
src/app/api/<feature>/route.ts  → thin glue via defineRoute
src/app/actions/<feature>.ts    → thin glue via defineAction
```

Services receive `(supabase, user, input)` and return typed data. They never
return null/undefined on failure — they throw.

## Zod Schema Conventions

- Named: `<Verb><Noun>Schema` (e.g. `createChoreSchema`)
- Type: `<Verb><NounInput` (inferred)
- IDs: `z.string().uuid()` — client-generated for optimistic UI
- Strings: `.trim().min(1).max(N)`
- Optionals: `.nullish()`
- Enums: `z.enum([...])` or `z.enum(domainConstant)`
