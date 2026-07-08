import { defineRoute } from "@/lib/api/define-route";
import { openLoveNoteSchema } from "@/lib/schemas/love-note";
import { openLoveNote } from "@/lib/services/love-notes";

export const PATCH = defineRoute({
  input: openLoveNoteSchema,
  handler: ({ supabase, params, input }) => openLoveNote(supabase, params.id, input),
});
