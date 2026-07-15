import { defineRoute } from "@/lib/api/define-route";
import { buyAccessory } from "@/lib/services/pets";
import { buyAccessorySchema } from "@/lib/schemas/pet";

export const POST = defineRoute({
  input: buyAccessorySchema,
  handler: ({ supabase, user, input }) => buyAccessory(supabase, user, input),
});
