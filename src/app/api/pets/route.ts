import { defineRoute } from "@/lib/api/define-route";
import { requireCoupleId } from "@/lib/services/couples";
import { getPet, adoptPet, renamePet } from "@/lib/services/pets";
import { adoptPetSchema, renamePetSchema } from "@/lib/schemas/pet";

export const GET = defineRoute({
  handler: async ({ supabase, user }) => {
    const coupleId = await requireCoupleId(supabase, user);
    return getPet(supabase, coupleId, user.id);
  },
});

export const POST = defineRoute({
  input: adoptPetSchema,
  handler: ({ supabase, user, input }) => adoptPet(supabase, user, input),
});

export const PATCH = defineRoute({
  input: renamePetSchema,
  handler: ({ supabase, user, input }) => renamePet(supabase, user, input.name),
});
