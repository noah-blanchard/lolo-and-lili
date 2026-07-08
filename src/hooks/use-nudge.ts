"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { NudgeState, NudgeKind } from "@/lib/nudges";

export function useNudgeState() {
  return useQuery({
    queryKey: queryKeys.nudges(),
    queryFn: () => apiFetch<NudgeState>("/api/nudges"),
  });
}

export function useSendNudge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (kind: NudgeKind) =>
      apiFetch<NudgeState>("/api/nudges", jsonBody({ kind })),
    onSuccess: (state) => qc.setQueryData(queryKeys.nudges(), state),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.nudges() }),
  });
}
