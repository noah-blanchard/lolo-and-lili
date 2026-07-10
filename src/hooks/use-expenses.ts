"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { adjustBalance, type ExpensesView } from "@/lib/expenses";
import type { Expense } from "@/lib/supabase/types";
import type { AddExpenseInput } from "@/lib/schemas/expense";
import { useCouple } from "@/components/providers/couple-provider";

export function useExpenses() {
  return useQuery({
    queryKey: queryKeys.expenses(),
    queryFn: () => apiFetch<ExpensesView>("/api/expenses"),
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  const { me, partner, coupleId } = useCouple();

  return useMutation({
    mutationFn: (input: AddExpenseInput) =>
      apiFetch<unknown>("/api/expenses", jsonBody(input)),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.expenses() });
      const previous = queryClient.getQueryData<ExpensesView>(queryKeys.expenses());
      const currency = input.currency ?? "EUR";
      const optimistic: Expense = {
        id: input.id,
        couple_id: coupleId,
        payer_id: me.id,
        amount_cents: Math.round(input.amount * 100),
        currency,
        description: input.description,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<ExpensesView>(queryKeys.expenses(), (old) => {
        const base: ExpensesView = old ?? { expenses: [], balance: null };
        return {
          expenses: [optimistic, ...base.expenses],
          balance: partner
            ? adjustBalance(
                base.balance,
                me.id,
                partner.id,
                me.id,
                optimistic.amount_cents,
                currency,
                1,
              )
            : base.balance,
        };
      });
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.expenses(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses() }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const { me, partner } = useCouple();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string }>(`/api/expenses/${id}`, { method: "DELETE" }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.expenses() });
      const previous = queryClient.getQueryData<ExpensesView>(queryKeys.expenses());
      queryClient.setQueryData<ExpensesView>(queryKeys.expenses(), (old) => {
        if (!old) return old;
        const removed = old.expenses.find((e) => e.id === id);
        return {
          expenses: old.expenses.filter((e) => e.id !== id),
          balance:
            removed && partner
              ? adjustBalance(
                  old.balance,
                  me.id,
                  partner.id,
                  removed.payer_id,
                  removed.amount_cents,
                  removed.currency,
                  -1,
                )
              : old.balance,
        };
      });
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.expenses(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses() }),
  });
}

export function useSettleUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<{ settled: boolean }>("/api/expenses/settle", { method: "POST" }),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.expenses() });
      const previous = queryClient.getQueryData<ExpensesView>(queryKeys.expenses());
      // Settling zeroes the balance; the expense ledger itself is unchanged.
      queryClient.setQueryData<ExpensesView>(queryKeys.expenses(), (old) =>
        old ? { ...old, balance: null } : old,
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.expenses(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses() }),
  });
}
