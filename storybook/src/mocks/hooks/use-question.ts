import { mockQuestionView, mockQuestionViewRevealed } from "../fixtures";

export function useQuestion() {
  return { data: mockQuestionView };
}
export function useQuestionRevealed() {
  return { data: mockQuestionViewRevealed };
}
export function useSubmitAnswer() {
  return { mutate: () => {}, isPending: false };
}
