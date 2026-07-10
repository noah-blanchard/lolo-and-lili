"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { GroceryItem, Meal } from "@/lib/supabase/types";
import type { UpsertMealInput } from "@/lib/schemas/meal";
import { useCouple } from "@/components/providers/couple-provider";

export function useMeals() {
  return useQuery({
    queryKey: queryKeys.meals(),
    queryFn: () => apiFetch<Meal[]>("/api/meals"),
  });
}

export function useUpsertMeal() {
  const queryClient = useQueryClient();
  const { me, coupleId } = useCouple();

  return useMutation({
    mutationFn: (input: UpsertMealInput) =>
      apiFetch<Meal>("/api/meals", jsonBody(input)),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.meals() });
      const previous = queryClient.getQueryData<Meal[]>(queryKeys.meals());
      queryClient.setQueryData<Meal[]>(queryKeys.meals(), (old) => {
        const list = old ?? [];
        const existing = list.find(
          (m) => m.date === input.date && m.slot === input.slot,
        );
        if (existing) {
          return list.map((m) =>
            m.id === existing.id
              ? {
                  ...m,
                  title: input.title,
                  cook_id: input.cook_id ?? null,
                  notes: input.notes ?? null,
                }
              : m,
          );
        }
        const optimistic: Meal = {
          // Temp id; the UI keys meal cells by date+slot, so it won't flicker
          // when the persisted row (with its real id) arrives on refetch.
          id: `optimistic-${input.date}-${input.slot}`,
          couple_id: coupleId,
          created_by: me.id,
          cook_id: input.cook_id ?? null,
          date: input.date,
          slot: input.slot,
          title: input.title,
          notes: input.notes ?? null,
          created_at: new Date().toISOString(),
        };
        return [...list, optimistic];
      });
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.meals(), ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.meals() }),
  });
}

export function useDeleteMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string }>(`/api/meals/${id}`, { method: "DELETE" }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.meals() });
      const previous = queryClient.getQueryData<Meal[]>(queryKeys.meals());
      queryClient.setQueryData<Meal[]>(queryKeys.meals(), (old) =>
        (old ?? []).filter((m) => m.id !== id),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.meals(), ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.meals() }),
  });
}

export function useAddIngredients() {
  const queryClient = useQueryClient();
  const { me, coupleId } = useCouple();

  return useMutation({
    mutationFn: (items: string[]) =>
      apiFetch<{ added: number }>("/api/meals/ingredients", jsonBody({ items })),

    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.grocery() });
      const previous = queryClient.getQueryData<GroceryItem[]>(queryKeys.grocery());
      queryClient.setQueryData<GroceryItem[]>(queryKeys.grocery(), (old) => {
        const list = old ?? [];
        const existing = new Set(list.map((i) => i.name.toLowerCase()));
        const additions: GroceryItem[] = items
          .filter((name) => !existing.has(name.toLowerCase()))
          .map((name) => ({
            id: `optimistic-${name}-${Date.now()}`,
            couple_id: coupleId,
            created_by: me.id,
            name,
            quantity: null,
            checked: false,
            checked_by: null,
            created_at: new Date().toISOString(),
          }));
        return [...additions, ...list];
      });
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.grocery(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.grocery() }),
  });
}
