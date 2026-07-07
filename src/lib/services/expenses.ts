import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Expense } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import { computeBalance, type ExpensesView } from "@/lib/expenses";
import type { AddExpenseInput } from "@/lib/schemas/expense";
import { getCoupleMembers, requireCoupleId } from "./couples";
import { notifyPartner } from "./notifications";

type DB = SupabaseClient<Database>;

/** Expenses (newest first) plus the current 50/50 balance. */
export async function getExpensesView(
  supabase: DB,
  user: User,
): Promise<ExpensesView> {
  const coupleId = await requireCoupleId(supabase, user);
  const members = await getCoupleMembers(supabase, coupleId);
  const ids = members.map((m) => m.id);

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);

  const { data: settlements } = await supabase
    .from("expense_settlements")
    .select("from_id, to_id, amount_cents");

  return {
    expenses: expenses ?? [],
    balance: computeBalance(ids, expenses ?? [], settlements ?? []),
  };
}

export async function addExpense(
  supabase: DB,
  user: User,
  input: AddExpenseInput,
): Promise<Expense> {
  const coupleId = await requireCoupleId(supabase, user);
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      id: input.id,
      couple_id: coupleId,
      payer_id: user.id,
      amount_cents: Math.round(input.amount * 100),
      currency: input.currency ?? "EUR",
      description: input.description,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to add expense");
  }
  await notifyPartner({
    actorId: user.id,
    coupleId,
    message: "expense_added",
    extra: `${(data.amount_cents / 100).toFixed(2)} ${data.currency} · ${data.description}`,
  });
  return data;
}

export async function deleteExpense(
  supabase: DB,
  id: string,
): Promise<{ id: string }> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return { id };
}

/** Record a settlement that zeroes the current balance. */
export async function settleUp(
  supabase: DB,
  user: User,
): Promise<{ settled: boolean }> {
  const coupleId = await requireCoupleId(supabase, user);
  const view = await getExpensesView(supabase, user);
  if (!view.balance) return { settled: false };

  const { debtorId, creditorId, amountCents } = view.balance;
  const { error } = await supabase.from("expense_settlements").insert({
    couple_id: coupleId,
    from_id: debtorId,
    to_id: creditorId,
    amount_cents: amountCents,
  });
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);

  await notifyPartner({ actorId: user.id, coupleId, message: "expense_settled" });
  return { settled: true };
}
