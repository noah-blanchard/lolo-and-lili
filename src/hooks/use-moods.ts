"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { Mood } from "@/lib/supabase/types";
import type { AddMoodInput } from "@/lib/schemas/mood";
import { useCouple } from "@/components/providers/couple-provider";

export function useMoods() {
  return useQuery({
    queryKey: queryKeys.moods(),
    queryFn: () => apiFetch<Mood[]>("/api/moods"),
  });
}

export function useAddMood() {
  const queryClient = useQueryClient();
  const { me, coupleId } = useCouple();

  return useMutation({
    mutationFn: (input: AddMoodInput) =>
      apiFetch<Mood>("/api/moods", jsonBody(input)),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.moods() });
      const previous = queryClient.getQueryData<Mood[]>(queryKeys.moods());

      const optimistic: Mood = {
        id: input.id,
        user_id: me.id,
        couple_id: coupleId,
        mood: input.mood,
        note: input.note ?? null,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Mood[]>(queryKeys.moods(), (old) => [
        optimistic,
        ...(old ?? []),
      ]);

      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.moods(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.moods() }),
  });
}
