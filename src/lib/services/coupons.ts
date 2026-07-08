import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Coupon, Database } from "@/lib/supabase/types";
import { ApiError, ErrorCode, fail } from "@/lib/api/result";
import type { MintCouponInput } from "@/lib/schemas/coupon";
import { requireCoupleId } from "./couples";
import { notifyPartner } from "./notifications";
import { spendTreats } from "./pets";

type DB = SupabaseClient<Database>;

/** All of the couple's coupons, newest first. */
export async function listCoupons(supabase: DB): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return data ?? [];
}

/** Mint a new coupon to gift your partner. */
export async function mintCoupon(
  supabase: DB,
  user: User,
  input: MintCouponInput,
): Promise<Coupon> {
  const coupleId = await requireCoupleId(supabase, user);

  const { data, error } = await supabase
    .from("coupons")
    .insert({
      id: input.id,
      couple_id: coupleId,
      created_by: user.id,
      title: input.title,
      emoji: input.emoji,
      cost_treats: input.cost_treats,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to mint coupon");
  }
  await notifyPartner({
    actorId: user.id,
    coupleId,
    message: "coupon_gifted",
    extra: input.title,
  });
  return data;
}

/** Redeem an available coupon (spends treats if it has a cost). */
export async function redeemCoupon(
  supabase: DB,
  user: User,
  couponId: string,
): Promise<Coupon> {
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", couponId)
    .maybeSingle();
  if (!coupon) throw fail.notFound("Coupon not found");
  if (coupon.status !== "available") {
    throw new ApiError(ErrorCode.CONFLICT, "This coupon was already redeemed");
  }
  // A coupon is a gift to the partner — its creator can never redeem it.
  if (coupon.created_by && coupon.created_by === user.id) {
    throw fail.forbidden("You can't redeem your own coupon");
  }

  // Costed coupons draw from the shared treats wallet.
  await spendTreats(supabase, user, coupon.cost_treats);

  const { data, error } = await supabase
    .from("coupons")
    .update({
      status: "redeemed",
      redeemed_by: user.id,
      redeemed_at: new Date().toISOString(),
    })
    .eq("id", couponId)
    .select("*")
    .single();
  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to redeem coupon");
  }
  await notifyPartner({
    actorId: user.id,
    coupleId: coupon.couple_id,
    message: "coupon_redeemed",
    extra: coupon.title,
  });
  return data;
}

export async function deleteCoupon(
  supabase: DB,
  couponId: string,
): Promise<{ id: string }> {
  const { error } = await supabase.from("coupons").delete().eq("id", couponId);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return { id: couponId };
}
