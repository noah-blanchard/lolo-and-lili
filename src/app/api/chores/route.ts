import { defineRoute } from "@/lib/api/define-route";
import { createChoreSchema } from "@/lib/schemas/chore";
import { createChore, listChores } from "@/lib/services/chores";

export const GET = defineRoute({
  handler: ({ supabase }) => listChores(supabase),
});

export const POST = defineRoute({
  input: createChoreSchema,
  handler: ({ supabase, user, input }) => createChore(supabase, user, input),
});
