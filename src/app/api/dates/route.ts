import { defineRoute } from "@/lib/api/define-route";
import { addSpecialDateSchema } from "@/lib/schemas/special-date";
import { addSpecialDate, listSpecialDates } from "@/lib/services/special-dates";

export const GET = defineRoute({
  handler: ({ supabase }) => listSpecialDates(supabase),
});

export const POST = defineRoute({
  input: addSpecialDateSchema,
  handler: ({ supabase, user, input }) => addSpecialDate(supabase, user, input),
});
