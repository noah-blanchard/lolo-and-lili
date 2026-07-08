export function useToggleBucket() {
  return { mutate: () => {} };
}
export function useDeleteBucket() {
  return { mutate: () => {} };
}
export function useAddBucket() {
  return { mutate: () => {}, isPending: false };
}
export function useBucket() {
  return { data: [] };
}
