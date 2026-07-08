import { mockStatuses } from "../fixtures";

export function useStatuses() {
  return { data: mockStatuses };
}
export function useSetStatus() {
  return { mutate: () => {}, isPending: false };
}
