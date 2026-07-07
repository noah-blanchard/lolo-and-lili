"use client";

import { useTranslations } from "next-intl";
import { useCoupons } from "@/hooks/use-coupons";
import { EmptyState } from "@/components/ui/empty-state";
import { CouponCard } from "./coupon-card";
import { MintCoupon } from "./mint-coupon";

export function CouponsBoard() {
  const t = useTranslations("coupons");
  const { data: coupons, isLoading } = useCoupons();
  const available = (coupons ?? []).filter((c) => c.status === "available");
  const used = (coupons ?? []).filter((c) => c.status === "redeemed");

  return (
    <div className="flex flex-col gap-5">
      <MintCoupon />

      {isLoading ? null : !coupons?.length ? (
        <EmptyState emoji="🎟️" title={t("empty")} description={t("emptyHint")} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {available.map((c) => (
              <CouponCard key={c.id} coupon={c} />
            ))}
          </div>
          {used.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="px-1 text-sm font-semibold text-muted">{t("usedTitle")}</h2>
              <div className="grid grid-cols-2 gap-3 opacity-70">
                {used.map((c) => (
                  <CouponCard key={c.id} coupon={c} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
