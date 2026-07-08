export function useToggleGrocery() {
  return { mutate: () => {} };
}
export function useDeleteGrocery() {
  return { mutate: () => {} };
}
export function useAddGrocery() {
  return { mutate: () => {}, isPending: false };
}
export function useGrocery() {
  return { data: [] };
}
