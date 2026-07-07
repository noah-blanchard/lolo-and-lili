import { defineRoute } from "@/lib/api/define-route";
import { deleteSpecialDate } from "@/lib/services/special-dates";

export const DELETE = defineRoute({
  handler: ({ supabase, params }) => deleteSpecialDate(supabase, params.id),
});
