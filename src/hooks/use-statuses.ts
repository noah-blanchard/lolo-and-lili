"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { Status } from "@/lib/supabase/types";
import type { SetStatusInput } from "@/lib/schemas/status";
import { useCouple } from "@/components/providers/couple-provider";

export function useStatuses() {
  return useQuery({
    queryKey: queryKeys.status(),
    queryFn: () => apiFetch<Status[]>("/api/status"),
  });
}

export function useSetStatus() {
  const queryClient = useQueryClient();
  const { me, coupleId } = useCouple();

  return useMutation({
    mutationFn: (input: SetStatusInput) =>
      apiFetch<Status>("/api/status", jsonBody(input)),

    // Optimistically flip our own status immediately.
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.status() });
      const previous = queryClient.getQueryData<Status[]>(queryKeys.status());

      queryClient.setQueryData<Status[]>(queryKeys.status(), (old) => {
        const list = old ? [...old] : [];
        const mine: Status = {
          user_id: me.id,
          couple_id: coupleId,
          state: input.state,
          emoji: null,
          note: input.note ?? null,
          updated_at: new Date().toISOString(),
        };
        const idx = list.findIndex((s) => s.user_id === me.id);
        if (idx >= 0) list[idx] = { ...list[idx], ...mine };
        else list.push(mine);
        return list;
      });

      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.status(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.status() }),
  });
}
