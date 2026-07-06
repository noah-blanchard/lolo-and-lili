import { defineRoute } from "@/lib/api/define-route";
import { setStatusSchema } from "@/lib/schemas/status";
import { getStatuses, setStatus } from "@/lib/services/statuses";

export const GET = defineRoute({
  handler: ({ supabase }) => getStatuses(supabase),
});

export const POST = defineRoute({
  input: setStatusSchema,
  handler: ({ supabase, user, input }) => setStatus(supabase, user, input),
});
