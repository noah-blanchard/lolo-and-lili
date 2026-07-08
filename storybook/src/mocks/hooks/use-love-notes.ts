import { mockLoveNotes } from "../fixtures";

export function useLoveNotes() {
  return { data: mockLoveNotes };
}
export function useAddLoveNote() {
  return { mutate: () => {}, isPending: false };
}
export function useDeleteLoveNote() {
  return { mutate: () => {} };
}
export function useSendNudge() {
  return { mutate: () => {}, isPending: false };
}
