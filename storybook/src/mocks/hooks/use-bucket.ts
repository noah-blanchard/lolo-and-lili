import { mockBucketItem, mockBucketItemDone } from "../fixtures";

export function useBucket() {
  return { data: [mockBucketItem, mockBucketItemDone] };
}
export function useAddBucket() {
  return { mutate: () => {}, isPending: false };
}
export function useToggleBucket() {
  return { mutate: () => {} };
}
export function useDeleteBucket() {
  return { mutate: () => {} };
}
export function useSpinBucket() {
  return { mutate: () => {}, isPending: false };
}
