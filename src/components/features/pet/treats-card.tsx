"use client";

import { useTranslations } from "next-intl";
import { usePet } from "@/hooks/use-pet";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** The shared treat wallet (🪙) surfaced on the home screen. */
export function TreatsCard() {
  const t = useTranslations("home.money");
  const { data: pet, isLoading } = usePet();
  if (isLoading) {
    return (
      <Card className="flex items-center gap-3">
        <Skeleton className="size-11 shrink-0 rounded-cute" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
      </Card>
    );
  }
  if (!pet) return null; // wallet lives on the pet; nothing to show pre-adoption

  return (
    <Card className="flex items-center gap-3">
      <span className="text-3xl" aria-hidden>
        🪙
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold">
          {pet.treats} {t("label")}
        </p>
        <p className="truncate text-sm text-muted">{t("hint")}</p>
      </div>
    </Card>
  );
}
