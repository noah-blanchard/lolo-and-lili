"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { LoveNote } from "@/lib/supabase/types";
import type { AddLoveNoteInput, OpenLoveNoteInput } from "@/lib/schemas/love-note";
import { useCouple } from "@/components/providers/couple-provider";

export function useLoveNotes() {
  return useQuery({
    queryKey: queryKeys.loveNotes(),
    queryFn: () => apiFetch<LoveNote[]>("/api/notes"),
  });
}

export function useAddLoveNote() {
  const queryClient = useQueryClient();
  const { me, coupleId } = useCouple();

  return useMutation({
    mutationFn: (input: AddLoveNoteInput) =>
      apiFetch<LoveNote>("/api/notes", jsonBody(input)),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.loveNotes() });
      const previous = queryClient.getQueryData<LoveNote[]>(queryKeys.loveNotes());
      const optimistic: LoveNote = {
        id: input.id,
        couple_id: coupleId,
        author_id: me.id,
        body: input.body,
        accent: input.accent,
        created_at: new Date().toISOString(),
        opened_at: null,
      };
      queryClient.setQueryData<LoveNote[]>(queryKeys.loveNotes(), (old) => [
        optimistic,
        ...(old ?? []),
      ]);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.loveNotes(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.loveNotes() }),
  });
}

export function useDeleteLoveNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) =>
      apiFetch<{ id: string }>(`/api/notes/${noteId}`, { method: "DELETE" }),

    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.loveNotes() });
      const previous = queryClient.getQueryData<LoveNote[]>(queryKeys.loveNotes());
      queryClient.setQueryData<LoveNote[]>(queryKeys.loveNotes(), (old) =>
        (old ?? []).filter((n) => n.id !== noteId),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.loveNotes(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.loveNotes() }),
  });
}

/** Mark a love note as opened (shared state between partners). */
export function useOpenLoveNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, input }: { noteId: string; input: OpenLoveNoteInput }) =>
      apiFetch<LoveNote>(`/api/notes/${noteId}/open`, jsonBody(input)),

    onMutate: async ({ noteId, input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.loveNotes() });
      const previous = queryClient.getQueryData<LoveNote[]>(queryKeys.loveNotes());
      queryClient.setQueryData<LoveNote[]>(queryKeys.loveNotes(), (old) =>
        (old ?? []).map((n) =>
          n.id === noteId ? { ...n, opened_at: input.opened_at } : n,
        ),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.loveNotes(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.loveNotes() }),
  });
}

/** Fire the background "thinking of you" push (best-effort). */
export function useSendNudge() {
  return useMutation({
    mutationFn: () => apiFetch<{ sent: boolean }>("/api/notes/nudge", { method: "POST" }),
  });
}
