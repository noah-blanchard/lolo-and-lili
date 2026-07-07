import { defineRoute } from "@/lib/api/define-route";
import { care } from "@/lib/services/pets";
import { careSchema } from "@/lib/schemas/pet";

export const POST = defineRoute({
  input: careSchema,
  handler: ({ supabase, user, input }) => care(supabase, user, input),
});
