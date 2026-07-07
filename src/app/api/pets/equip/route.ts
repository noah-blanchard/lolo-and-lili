import { defineRoute } from "@/lib/api/define-route";
import { equip } from "@/lib/services/pets";
import { equipSchema } from "@/lib/schemas/pet";

export const POST = defineRoute({
  input: equipSchema,
  handler: ({ supabase, user, input }) => equip(supabase, user, input),
});
