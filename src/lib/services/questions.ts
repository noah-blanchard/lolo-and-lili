import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import { today } from "@/lib/chores";
import { questionForDate, type QuestionView } from "@/lib/questions";
import type { SubmitAnswerInput } from "@/lib/schemas/question";
import { requireCoupleId } from "./couples";
import { notifyPartner } from "./notifications";
import { awardTreats } from "./pets";

type DB = SupabaseClient<Database>;

/** Today's question + answers. The partner's answer is withheld until I answer. */
export async function getTodayQuestion(
  supabase: DB,
  user: User,
): Promise<QuestionView> {
  const coupleId = await requireCoupleId(supabase, user);
  const date = today();
  const q = questionForDate(date);

  const { data: answers, error } = await supabase
    .from("question_answers")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("question_date", date);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);

  const mine = answers?.find((a) => a.user_id === user.id) ?? null;
  const partner = answers?.find((a) => a.user_id !== user.id) ?? null;
  const revealed = !!mine && !!partner;

  return {
    date,
    questionKey: q.key,
    myAnswer: mine?.answer ?? null,
    partnerAnswer: revealed ? (partner?.answer ?? null) : null,
    revealed,
  };
}

/** Submit (or update) my answer for today's question. */
export async function submitAnswer(
  supabase: DB,
  user: User,
  input: SubmitAnswerInput,
): Promise<QuestionView> {
  const coupleId = await requireCoupleId(supabase, user);
  const date = today();
  const q = questionForDate(date);

  // First answer for today earns a treat (upsert is idempotent, so only the
  // first submit — not edits — should pay out).
  const { data: existingMine } = await supabase
    .from("question_answers")
    .select("id")
    .eq("couple_id", coupleId)
    .eq("question_date", date)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("question_answers").upsert(
    {
      couple_id: coupleId,
      question_date: date,
      question_key: q.key,
      user_id: user.id,
      answer: input.answer,
    },
    { onConflict: "couple_id,question_date,user_id" },
  );
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);

  if (!existingMine) await awardTreats(supabase, user, 1);
  await notifyPartner({ actorId: user.id, coupleId, message: "question_answered" });
  return getTodayQuestion(supabase, user);
}
