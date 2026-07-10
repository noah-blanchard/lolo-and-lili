import type { Expense } from "@/lib/supabase/types";

export interface Balance {
  debtorId: string;
  creditorId: string;
  amountCents: number;
  currency: string;
}

export interface ExpensesView {
  expenses: Expense[];
  balance: Balance | null;
}

interface SettlementLite {
  from_id: string | null;
  to_id: string | null;
  amount_cents: number;
}

/**
 * 50/50 net balance between the couple's two members, after settlements.
 * Returns who owes whom (or null if square). Pure — safe on client + server.
 */
export function computeBalance(
  memberIds: string[],
  expenses: Expense[],
  settlements: SettlementLite[],
): Balance | null {
  if (memberIds.length < 2) return null;
  const [a, b] = memberIds;
  const net: Record<string, number> = { [a]: 0, [b]: 0 };
  let currency = "EUR";

  for (const e of expenses) {
    currency = e.currency ?? currency;
    if (e.payer_id && e.payer_id in net) net[e.payer_id] += e.amount_cents;
    const half = e.amount_cents / 2;
    net[a] -= half;
    net[b] -= half;
  }
  for (const s of settlements) {
    if (s.from_id && s.from_id in net) net[s.from_id] += s.amount_cents;
    if (s.to_id && s.to_id in net) net[s.to_id] -= s.amount_cents;
  }

  const diff = Math.round(net[a]);
  if (Math.abs(diff) < 1) return null;
  return diff > 0
    ? { debtorId: b, creditorId: a, amountCents: diff, currency }
    : { debtorId: a, creditorId: b, amountCents: -diff, currency };
}

/**
 * Incrementally adjust the 50/50 balance when a single expense is added
 * (`sign = 1`) or removed (`sign = -1`), without needing the full settlement
 * history (which the client cache doesn't hold). Used for optimistic updates;
 * the authoritative value reconciles on the next refetch. `meNet` is what the
 * partner owes me (positive) or I owe the partner (negative).
 */
export function adjustBalance(
  current: Balance | null,
  meId: string,
  partnerId: string,
  payerId: string | null,
  amountCents: number,
  currency: string,
  sign: 1 | -1,
): Balance | null {
  let meNet = 0;
  let cur = currency;
  if (current) {
    meNet = current.creditorId === meId ? current.amountCents : -current.amountCents;
    cur = current.currency;
  }
  const half = amountCents / 2;
  // The payer is owed `half` by the other member.
  const delta = payerId === meId ? half : -half;
  meNet += sign * delta;

  const rounded = Math.round(meNet);
  if (Math.abs(rounded) < 1) return null;
  return rounded > 0
    ? { debtorId: partnerId, creditorId: meId, amountCents: rounded, currency: cur }
    : { debtorId: meId, creditorId: partnerId, amountCents: -rounded, currency: cur };
}

export function formatMoney(cents: number, currency: string, locale: string): string {
  return (cents / 100).toLocaleString(locale === "zh" ? "zh-CN" : "fr-FR", {
    style: "currency",
    currency,
  });
}
