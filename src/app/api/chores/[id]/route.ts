import { defineRoute } from "@/lib/api/define-route";
import { deleteChore, toggleCompletion } from "@/lib/services/chores";

// Toggle today's completion for this chore.
export const PATCH = defineRoute({
  handler: ({ supabase, user, params }) =>
    toggleCompletion(supabase, user, params.id),
});

// Delete the chore entirely.
export const DELETE = defineRoute({
  handler: ({ supabase, params }) => deleteChore(supabase, params.id),
});
