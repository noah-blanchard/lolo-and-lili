import { mockSpecialDate } from "../fixtures";

export function useSpecialDates() {
  return { data: [mockSpecialDate] };
}
export function useAddSpecialDate() {
  return { mutate: () => {}, isPending: false };
}
export function useDeleteSpecialDate() {
  return { mutate: () => {} };
}
