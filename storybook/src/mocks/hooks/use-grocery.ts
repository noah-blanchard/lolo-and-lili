import { mockGroceryItem, mockGroceryItemChecked } from "../fixtures";

export function useGrocery() {
  return { data: [mockGroceryItem, mockGroceryItemChecked] };
}
export function useAddGrocery() {
  return { mutate: () => {}, isPending: false };
}
export function useToggleGrocery() {
  return { mutate: () => {} };
}
export function useDeleteGrocery() {
  return { mutate: () => {} };
}
export function useClearChecked() {
  return { mutate: () => {}, isPending: false };
}
