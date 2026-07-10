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
import { springSoft } from "@/lib/motion";
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
    <div className="coupon-ticket relative bg-surface px-5 py-4">
      <div className="flex h-16 items-center gap-2">
        <span className="text-3xl">{coupon.emoji}</span>
        <p className="flex-1 line-clamp-1 font-display font-semibold leading-tight">
          {coupon.title}
        </p>
        {mine && !used && (
          <button
            type="button"
            aria-label={t("delete")}
            onClick={() => del.mutate(coupon.id)}
            className="text-muted/60 transition-colors hover:text-busy"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      <div className="my-3 border-t border-dashed border-border" />

      <div className="h-12 flex items-center justify-between gap-2">
        {coupon.cost_treats > 0 && (
          <span className="text-xs text-muted">🪙 {coupon.cost_treats}</span>
        )}
        {mine ? (
          <span className="self-start rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">
            {t("sentLabel")}
          </span>
        ) : (
          <Button
            size="sm"
            onClick={onRedeem}
            loading={redeem.isPending}
            className="ml-auto"
          >
            {t("redeem")}
          </Button>
        )}
      </div>

      {used && (
        <motion.div
          initial={{ scale: 1.8, opacity: 0, rotate: -18 }}
          animate={{ scale: 1, opacity: 1, rotate: -12 }}
          transition={springSoft}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="rounded-full border-2 border-busy/70 px-4 py-1 font-display text-lg font-bold uppercase tracking-wide text-busy/80">
            {t("used")}
          </span>
        </motion.div>
      )}
    </div>
  );
}
