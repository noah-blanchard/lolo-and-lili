"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { type ChoreWithStatus } from "@/lib/chores";
import type { CreateChoreInput } from "@/lib/schemas/chore";
import { useCouple } from "@/components/providers/couple-provider";

export function useChores() {
  return useQuery({
    queryKey: queryKeys.chores(),
    queryFn: () => apiFetch<ChoreWithStatus[]>("/api/chores"),
  });
}

export function useCreateChore() {
  const queryClient = useQueryClient();
  const { me, coupleId } = useCouple();

  return useMutation({
    mutationFn: (input: CreateChoreInput) =>
      apiFetch<ChoreWithStatus>("/api/chores", jsonBody(input)),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.chores() });
      const previous = queryClient.getQueryData<ChoreWithStatus[]>(
        queryKeys.chores(),
      );
      const optimistic: ChoreWithStatus = {
        id: input.id,
        couple_id: coupleId,
        title: input.title,
        assignee_id: input.assignee_id ?? null,
        due_date: input.due_date ?? null,
        recurrence: input.recurrence,
        points: input.points,
        created_by: me.id,
        created_at: new Date().toISOString(),
        completed_today: false,
        completed_by: null,
      };
      queryClient.setQueryData<ChoreWithStatus[]>(queryKeys.chores(), (old) => [
        ...(old ?? []),
        optimistic,
      ]);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.chores(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.chores() }),
  });
}

export function useToggleChore() {
  const queryClient = useQueryClient();
  const { me } = useCouple();

  return useMutation({
    mutationFn: (choreId: string) =>
      apiFetch<{ completed_today: boolean }>(`/api/chores/${choreId}`, {
        method: "PATCH",
      }),

    onMutate: async (choreId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.chores() });
      const previous = queryClient.getQueryData<ChoreWithStatus[]>(
        queryKeys.chores(),
      );
      queryClient.setQueryData<ChoreWithStatus[]>(queryKeys.chores(), (old) =>
        (old ?? []).map((c) =>
          c.id === choreId
            ? {
                ...c,
                completed_today: !c.completed_today,
                completed_by: c.completed_today ? null : me.id,
              }
            : c,
        ),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.chores(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.chores() }),
  });
}

export function useDeleteChore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (choreId: string) =>
      apiFetch<{ id: string }>(`/api/chores/${choreId}`, { method: "DELETE" }),

    onMutate: async (choreId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.chores() });
      const previous = queryClient.getQueryData<ChoreWithStatus[]>(
        queryKeys.chores(),
      );
      queryClient.setQueryData<ChoreWithStatus[]>(queryKeys.chores(), (old) =>
        (old ?? []).filter((c) => c.id !== choreId),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.chores(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.chores() }),
  });
}
