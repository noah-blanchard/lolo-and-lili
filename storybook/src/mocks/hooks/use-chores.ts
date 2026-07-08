export function useToggleChore() {
  return { mutate: () => {} };
}
export function useDeleteChore() {
  return { mutate: () => {} };
}
export function useAddChore() {
  return { mutate: () => {}, isPending: false };
}
export function useChores() {
  return { data: [] };
}
