"use client";

import { useTranslations } from "next-intl";
import { usePet } from "@/hooks/use-pet";
import { Card } from "@/components/ui/card";

/** The shared treat wallet (🪙) surfaced on the home screen. */
export function TreatsCard() {
  const t = useTranslations("home.money");
  const { data: pet } = usePet();
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
