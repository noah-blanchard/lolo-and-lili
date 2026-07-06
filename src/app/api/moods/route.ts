import { defineRoute } from "@/lib/api/define-route";
import { addMoodSchema } from "@/lib/schemas/mood";
import { addMood, listMoods } from "@/lib/services/moods";

export const GET = defineRoute({
  handler: ({ supabase }) => listMoods(supabase),
});

export const POST = defineRoute({
  input: addMoodSchema,
  handler: ({ supabase, user, input }) => addMood(supabase, user, input),
});
