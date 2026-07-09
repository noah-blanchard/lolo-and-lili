import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Expense } from "@/lib/supabase/types";
import { ApiError, ErrorCode, fail } from "@/lib/api/result";
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
  const currency = input.currency ?? "EUR";

  // Keep the ledger single-currency: computeBalance sums cents across every row
  // regardless of currency, so a second currency yields a meaningless balance
  // (see F-011). Reject an expense that doesn't match the existing ledger.
  const { data: mismatch } = await supabase
    .from("expenses")
    .select("id")
    .neq("currency", currency)
    .limit(1);
  if (mismatch && mismatch.length > 0) {
    throw fail.conflict("All expenses must use the same currency");
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      id: input.id,
      couple_id: coupleId,
      payer_id: user.id,
      amount_cents: Math.round(input.amount * 100),
      currency,
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

  // Guard against a double-submit (or both partners tapping at once) racing two
  // identical settlement rows (F-008): if the same settlement was just recorded,
  // treat this call as a no-op instead of inserting a duplicate that would flip
  // the balance into a phantom debt.
  const recentSince = new Date(Date.now() - 30_000).toISOString();
  const { data: dup } = await supabase
    .from("expense_settlements")
    .select("id")
    .eq("from_id", debtorId)
    .eq("to_id", creditorId)
    .eq("amount_cents", amountCents)
    .gte("created_at", recentSince)
    .limit(1);
  if (dup && dup.length > 0) return { settled: false };

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
