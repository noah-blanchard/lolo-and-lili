"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { GroceryItem } from "@/lib/supabase/types";
import type { AddGroceryInput } from "@/lib/schemas/grocery";
import { useCouple } from "@/components/providers/couple-provider";

export function useGrocery() {
  return useQuery({
    queryKey: queryKeys.grocery(),
    queryFn: () => apiFetch<GroceryItem[]>("/api/grocery"),
  });
}

export function useAddGrocery() {
  const queryClient = useQueryClient();
  const { me, coupleId } = useCouple();

  return useMutation({
    mutationFn: (input: AddGroceryInput) =>
      apiFetch<GroceryItem>("/api/grocery", jsonBody(input)),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.grocery() });
      const previous = queryClient.getQueryData<GroceryItem[]>(queryKeys.grocery());
      const optimistic: GroceryItem = {
        id: input.id,
        couple_id: coupleId,
        name: input.name,
        quantity: input.quantity ?? null,
        checked: false,
        checked_by: null,
        created_by: me.id,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<GroceryItem[]>(queryKeys.grocery(), (old) => [
        ...(old ?? []),
        optimistic,
      ]);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.grocery(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.grocery() }),
  });
}

export function useToggleGrocery() {
  const queryClient = useQueryClient();
  const { me } = useCouple();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<GroceryItem>(`/api/grocery/${id}`, { method: "PATCH" }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.grocery() });
      const previous = queryClient.getQueryData<GroceryItem[]>(queryKeys.grocery());
      queryClient.setQueryData<GroceryItem[]>(queryKeys.grocery(), (old) =>
        (old ?? []).map((i) =>
          i.id === id
            ? { ...i, checked: !i.checked, checked_by: i.checked ? null : me.id }
            : i,
        ),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.grocery(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.grocery() }),
  });
}

export function useDeleteGrocery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string }>(`/api/grocery/${id}`, { method: "DELETE" }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.grocery() });
      const previous = queryClient.getQueryData<GroceryItem[]>(queryKeys.grocery());
      queryClient.setQueryData<GroceryItem[]>(queryKeys.grocery(), (old) =>
        (old ?? []).filter((i) => i.id !== id),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.grocery(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.grocery() }),
  });
}

export function useClearChecked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<{ cleared: true }>("/api/grocery/clear", { method: "POST" }),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.grocery() });
      const previous = queryClient.getQueryData<GroceryItem[]>(queryKeys.grocery());
      queryClient.setQueryData<GroceryItem[]>(queryKeys.grocery(), (old) =>
        (old ?? []).filter((i) => !i.checked),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.grocery(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.grocery() }),
  });
}
