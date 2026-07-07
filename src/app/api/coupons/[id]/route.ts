import { defineRoute } from "@/lib/api/define-route";
import { deleteCoupon } from "@/lib/services/coupons";

export const DELETE = defineRoute({
  handler: ({ supabase, params }) => deleteCoupon(supabase, params.id),
});
