import { defineRoute } from "@/lib/api/define-route";
import { addLoveNoteSchema } from "@/lib/schemas/love-note";
import { addLoveNote, listLoveNotes } from "@/lib/services/love-notes";

export const GET = defineRoute({
  handler: ({ supabase }) => listLoveNotes(supabase),
});

export const POST = defineRoute({
  input: addLoveNoteSchema,
  handler: ({ supabase, user, input }) => addLoveNote(supabase, user, input),
});
