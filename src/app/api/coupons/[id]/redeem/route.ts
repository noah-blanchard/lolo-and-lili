import { defineRoute } from "@/lib/api/define-route";
import { redeemCoupon } from "@/lib/services/coupons";

export const runtime = "nodejs";

export const POST = defineRoute({
  handler: ({ supabase, user, params }) => redeemCoupon(supabase, user, params.id),
});
