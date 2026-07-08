"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCoupons } from "@/hooks/use-coupons";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { CouponCard } from "./coupon-card";
import { MintCoupon } from "./mint-coupon";
import { useCouple } from "@/components/providers/couple-provider";
import type { Coupon } from "@/lib/supabase/types";

type CouponTab = "received" | "sent";

export function CouponsBoard() {
  const t = useTranslations("coupons");
  const { me } = useCouple();
  const { data: coupons, isLoading } = useCoupons();
  const [tab, setTab] = useState<CouponTab>("received");

  const all = coupons ?? [];
  const received = all.filter((c) => c.created_by !== me.id);
  const sent = all.filter((c) => c.created_by === me.id);
  const active = tab === "received" ? received : sent;

  const available = active.filter((c) => c.status === "available");
  const used = active.filter((c) => c.status === "redeemed");

  return (
    <div className="flex flex-col gap-5">
      <MintCoupon />

      {isLoading ? (
        <>
          <Skeleton className="h-10 w-full rounded-full" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-cute bg-surface p-5 shadow-soft">
                <Skeleton className="mb-2 h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        </>
      ) : !all.length ? (
        <EmptyState emoji="🎟️" title={t("empty")} description={t("emptyHint")} />
      ) : (
        <>
          <SegmentedToggle<CouponTab>
            value={tab}
            onChange={setTab}
            options={[
              { value: "received", label: t("received") },
              { value: "sent", label: t("sent") },
            ]}
          />

          {active.length === 0 ? (
            <EmptyState
              emoji="🎟️"
              title={t(tab === "received" ? "emptyReceived" : "emptySent")}
              description={t(tab === "received" ? "emptyReceivedHint" : "emptySentHint")}
            />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {available.map((c: Coupon) => (
                  <CouponCard key={c.id} coupon={c} />
                ))}
              </div>
              {used.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h2 className="px-1 text-sm font-semibold text-muted">{t("usedTitle")}</h2>
                  <div className="flex flex-col gap-3 opacity-70">
                    {used.map((c: Coupon) => (
                      <CouponCard key={c.id} coupon={c} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
