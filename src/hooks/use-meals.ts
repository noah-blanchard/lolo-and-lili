"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { Meal } from "@/lib/supabase/types";
import type { UpsertMealInput } from "@/lib/schemas/meal";

export function useMeals() {
  return useQuery({
    queryKey: queryKeys.meals(),
    queryFn: () => apiFetch<Meal[]>("/api/meals"),
  });
}

export function useUpsertMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertMealInput) =>
      apiFetch<Meal>("/api/meals", jsonBody(input)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.meals() }),
  });
}

export function useDeleteMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string }>(`/api/meals/${id}`, { method: "DELETE" }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.meals() }),
  });
}

export function useAddIngredients() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: string[]) =>
      apiFetch<{ added: number }>("/api/meals/ingredients", jsonBody({ items })),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.grocery() }),
  });
}
