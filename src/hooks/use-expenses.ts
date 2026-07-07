"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { ExpensesView } from "@/lib/expenses";
import type { AddExpenseInput } from "@/lib/schemas/expense";

export function useExpenses() {
  return useQuery({
    queryKey: queryKeys.expenses(),
    queryFn: () => apiFetch<ExpensesView>("/api/expenses"),
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddExpenseInput) =>
      apiFetch<unknown>("/api/expenses", jsonBody(input)),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses() }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string }>(`/api/expenses/${id}`, { method: "DELETE" }),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses() }),
  });
}

export function useSettleUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ settled: boolean }>("/api/expenses/settle", { method: "POST" }),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses() }),
  });
}
