"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { QuestionView } from "@/lib/questions";
import type { SubmitAnswerInput } from "@/lib/schemas/question";

export function useQuestion() {
  return useQuery({
    queryKey: queryKeys.question(),
    queryFn: () => apiFetch<QuestionView>("/api/question"),
  });
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitAnswerInput) =>
      apiFetch<QuestionView>("/api/question", jsonBody(input)),

    onSuccess: (view) => {
      queryClient.setQueryData(queryKeys.question(), view);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.question() }),
  });
}
