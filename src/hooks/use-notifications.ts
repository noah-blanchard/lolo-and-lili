"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { AppNotification } from "@/lib/schemas/notification";

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: () => apiFetch<AppNotification[]>("/api/notifications"),
  });
}

export function useUnreadCount() {
  const { data } = useNotifications();
  return data?.filter((n) => !n.read).length ?? 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string }>(`/api/notifications/${id}`, { method: "PATCH" }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications() });
      const previous = queryClient.getQueryData<AppNotification[]>(
        queryKeys.notifications(),
      );
      queryClient.setQueryData<AppNotification[]>(queryKeys.notifications(), (old) =>
        (old ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.notifications(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<{ updated: number }>("/api/notifications", { method: "POST" }),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications() });
      const previous = queryClient.getQueryData<AppNotification[]>(
        queryKeys.notifications(),
      );
      queryClient.setQueryData<AppNotification[]>(queryKeys.notifications(), (old) =>
        (old ?? []).map((n) => ({ ...n, read: true })),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.notifications(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() }),
  });
}
