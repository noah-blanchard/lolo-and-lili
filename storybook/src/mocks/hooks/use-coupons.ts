export function useRedeemCoupon() {
  return { mutate: () => {}, isPending: false };
}
export function useDeleteCoupon() {
  return { mutate: () => {} };
}
export function useMintCoupon() {
  return { mutate: () => {}, isPending: false };
}
export function useCoupons() {
  return { data: [] };
}
