import { mockBalance } from "../fixtures";
import type { Expense } from "@/lib/supabase/types";

const mockExpenses = [
  {
    id: "e1",
    couple_id: "couple-storybook",
    payer_id: "me-storybook",
    description: "Courses",
    amount_cents: 4200,
    currency: "EUR",
    paid_at: new Date().toISOString(),
  },
  {
    id: "e2",
    couple_id: "couple-storybook",
    payer_id: "partner-storybook",
    description: "Resto",
    amount_cents: 7800,
    currency: "EUR",
    paid_at: new Date().toISOString(),
  },
] as unknown as Expense[];

export function useExpenses() {
  return { data: { expenses: mockExpenses, balance: mockBalance } };
}
export function useAddExpense() {
  return { mutate: () => {}, isPending: false };
}
export function useDeleteExpense() {
  return { mutate: () => {} };
}
export function useSettleUp() {
  return { mutate: () => {}, isPending: false };
}
