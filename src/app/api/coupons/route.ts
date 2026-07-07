import { defineRoute } from "@/lib/api/define-route";
import { mintCouponSchema } from "@/lib/schemas/coupon";
import { listCoupons, mintCoupon } from "@/lib/services/coupons";

export const GET = defineRoute({
  handler: ({ supabase }) => listCoupons(supabase),
});

export const POST = defineRoute({
  input: mintCouponSchema,
  handler: ({ supabase, user, input }) => mintCoupon(supabase, user, input),
});
