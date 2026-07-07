import { defineRoute } from "@/lib/api/define-route";
import { deleteLoveNote } from "@/lib/services/love-notes";

export const DELETE = defineRoute({
  handler: ({ supabase, params }) => deleteLoveNote(supabase, params.id),
});
