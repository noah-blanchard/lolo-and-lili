import { mockChoreTodo, mockChoreDone } from "../fixtures";

export function useChores() {
  return { data: [mockChoreTodo, mockChoreDone] };
}
export function useCreateChore() {
  return { mutate: () => {}, isPending: false };
}
export function useAddChore() {
  return { mutate: () => {}, isPending: false };
}
export function useToggleChore() {
  return { mutate: () => {} };
}
export function useDeleteChore() {
  return { mutate: () => {} };
}
