export function useDeleteSpecialDate() {
  return { mutate: () => {} };
}
export function useAddSpecialDate() {
  return { mutate: () => {}, isPending: false };
}
export function useSpecialDates() {
  return { data: [] };
}
