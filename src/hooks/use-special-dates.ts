"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { SpecialDate } from "@/lib/supabase/types";
import type { AddSpecialDateInput } from "@/lib/schemas/special-date";
import { useCouple } from "@/components/providers/couple-provider";

export function useSpecialDates() {
  return useQuery({
    queryKey: queryKeys.specialDates(),
    queryFn: () => apiFetch<SpecialDate[]>("/api/dates"),
  });
}

export function useAddSpecialDate() {
  const queryClient = useQueryClient();
  const { me, coupleId } = useCouple();

  return useMutation({
    mutationFn: (input: AddSpecialDateInput) =>
      apiFetch<SpecialDate>("/api/dates", jsonBody(input)),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.specialDates() });
      const previous = queryClient.getQueryData<SpecialDate[]>(queryKeys.specialDates());
      const optimistic: SpecialDate = {
        id: input.id,
        couple_id: coupleId,
        title: input.title,
        date: input.date,
        kind: input.kind,
        recurring: input.recurring,
        emoji: input.emoji,
        created_by: me.id,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<SpecialDate[]>(queryKeys.specialDates(), (old) => [
        ...(old ?? []),
        optimistic,
      ]);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.specialDates(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.specialDates() }),
  });
}

export function useDeleteSpecialDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string }>(`/api/dates/${id}`, { method: "DELETE" }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.specialDates() });
      const previous = queryClient.getQueryData<SpecialDate[]>(queryKeys.specialDates());
      queryClient.setQueryData<SpecialDate[]>(queryKeys.specialDates(), (old) =>
        (old ?? []).filter((d) => d.id !== id),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.specialDates(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.specialDates() }),
  });
}
