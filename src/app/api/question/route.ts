import { defineRoute } from "@/lib/api/define-route";
import { submitAnswerSchema } from "@/lib/schemas/question";
import { getTodayQuestion, submitAnswer } from "@/lib/services/questions";

export const GET = defineRoute({
  handler: ({ supabase, user }) => getTodayQuestion(supabase, user),
});

export const POST = defineRoute({
  input: submitAnswerSchema,
  handler: ({ supabase, user, input }) => submitAnswer(supabase, user, input),
});
