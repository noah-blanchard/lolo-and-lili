"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { BucketItem } from "@/lib/supabase/types";
import type { AddBucketInput } from "@/lib/schemas/bucket";
import { useCouple } from "@/components/providers/couple-provider";

export function useBucket() {
  return useQuery({
    queryKey: queryKeys.bucket(),
    queryFn: () => apiFetch<BucketItem[]>("/api/bucket"),
  });
}

export function useAddBucket() {
  const queryClient = useQueryClient();
  const { me, coupleId } = useCouple();

  return useMutation({
    mutationFn: (input: AddBucketInput) =>
      apiFetch<BucketItem>("/api/bucket", jsonBody(input)),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bucket() });
      const previous = queryClient.getQueryData<BucketItem[]>(queryKeys.bucket());
      const optimistic: BucketItem = {
        id: input.id,
        couple_id: coupleId,
        title: input.title,
        note: input.note ?? null,
        done: false,
        done_by: null,
        done_at: null,
        created_by: me.id,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<BucketItem[]>(queryKeys.bucket(), (old) => [
        optimistic,
        ...(old ?? []),
      ]);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.bucket(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.bucket() }),
  });
}

export function useToggleBucket() {
  const queryClient = useQueryClient();
  const { me } = useCouple();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<BucketItem>(`/api/bucket/${id}`, { method: "PATCH" }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bucket() });
      const previous = queryClient.getQueryData<BucketItem[]>(queryKeys.bucket());
      queryClient.setQueryData<BucketItem[]>(queryKeys.bucket(), (old) =>
        (old ?? []).map((i) =>
          i.id === id
            ? {
                ...i,
                done: !i.done,
                done_by: i.done ? null : me.id,
                done_at: i.done ? null : new Date().toISOString(),
              }
            : i,
        ),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.bucket(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.bucket() }),
  });
}

export function useDeleteBucket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string }>(`/api/bucket/${id}`, { method: "DELETE" }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bucket() });
      const previous = queryClient.getQueryData<BucketItem[]>(queryKeys.bucket());
      queryClient.setQueryData<BucketItem[]>(queryKeys.bucket(), (old) =>
        (old ?? []).filter((i) => i.id !== id),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.bucket(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.bucket() }),
  });
}
