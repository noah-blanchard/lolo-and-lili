import { defineRoute } from "@/lib/api/define-route";
import { requireCoupleId } from "@/lib/services/couples";
import { listMemories } from "@/lib/services/pets";

export const GET = defineRoute({
  handler: async ({ supabase, user }) => {
    const coupleId = await requireCoupleId(supabase, user);
    return listMemories(supabase, coupleId);
  },
});
