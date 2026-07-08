"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api/result";
import { celebrate } from "@/lib/confetti";
import { vibrate } from "@/lib/feedback";
import { Button } from "@/components/ui/button";
import { useCouple } from "@/components/providers/couple-provider";
import { useDeleteCoupon, useRedeemCoupon } from "@/hooks/use-coupons";
import type { Coupon } from "@/lib/supabase/types";

export function CouponCard({ coupon }: { coupon: Coupon }) {
  const t = useTranslations("coupons");
  const tc = useTranslations("common");
  const { me } = useCouple();
  const redeem = useRedeemCoupon();
  const del = useDeleteCoupon();
  const used = coupon.status === "redeemed";
  const mine = coupon.created_by === me.id;

  async function onRedeem() {
    try {
      await redeem.mutateAsync(coupon.id);
      celebrate();
      vibrate(30);
      toast.success(t("redeemed"));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : tc("error"));
    }
  }

  return (
    <motion.div
      layout
      className="relative flex flex-col gap-2 rounded-cute bg-surface p-4 shadow-soft"
    >
      <div className="flex items-start gap-2">
        <span className="text-3xl">{coupon.emoji}</span>
        <p className="flex-1 font-display font-semibold leading-tight">
          {coupon.title}
        </p>
      </div>
      {coupon.cost_treats > 0 && (
        <span className="text-xs text-muted">🪙 {coupon.cost_treats}</span>
      )}
      {used ? (
        <span className="mt-1 self-start rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">
          {t("used")}
        </span>
      ) : mine ? (
        <span className="mt-1 self-start rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">
          {t("sentLabel")}
        </span>
      ) : (
        <Button
          size="sm"
          onClick={onRedeem}
          disabled={redeem.isPending}
          className="mt-1"
        >
          {t("redeem")}
        </Button>
      )}
      {mine && !used && (
        <button
          type="button"
          aria-label={t("delete")}
          onClick={() => del.mutate(coupon.id)}
          className="absolute right-2 top-2 text-muted/60 transition-colors hover:text-busy"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </motion.div>
  );
}
