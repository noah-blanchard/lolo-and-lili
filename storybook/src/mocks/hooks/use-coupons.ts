import { mockCouponMine, mockCouponTheirs, mockCouponUsed } from "../fixtures";

export function useCoupons() {
  return { data: [mockCouponMine, mockCouponTheirs, mockCouponUsed] };
}
export function useMintCoupon() {
  return { mutate: () => {}, isPending: false };
}
export function useRedeemCoupon() {
  return { mutate: () => {}, isPending: false };
}
export function useDeleteCoupon() {
  return { mutate: () => {} };
}
