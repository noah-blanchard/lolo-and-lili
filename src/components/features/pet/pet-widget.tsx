"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { usePet, useCarePet } from "@/hooks/use-pet";
import { reactionEmoji, type PetActionType } from "@/lib/pets";
import { playSound, vibrate } from "@/lib/feedback";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { PetAvatar } from "./pet-avatar";
import { usePartnerCare } from "./use-pet-realtime";

export function PetWidget() {
  const t = useTranslations("pet");
  const { data: pet, isLoading } = usePet();
  const care = useCarePet();
  const [reaction, setReaction] = useState<{ id: number; emoji: string } | null>(
    null,
  );

  usePartnerCare((type) =>
    setReaction({ id: Date.now(), emoji: reactionEmoji(type as PetActionType) }),
  );

  if (isLoading) {
    return (
      <Card className="flex items-center gap-3">
        <Skeleton className="size-[72px] shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Skeleton className="size-11 rounded-cute" />
          <Skeleton className="size-11 rounded-cute" />
        </div>
      </Card>
    );
  }

  if (!pet) {
    return (
      <Link href="/pet">
        <Card className="flex items-center gap-3">
          <span className="text-3xl">🐶</span>
          <div className="min-w-0">
            <p className="font-display font-semibold">{t("adoptTitle")}</p>
            <p className="truncate text-sm text-muted">{t("adoptSubtitle")}</p>
          </div>
        </Card>
      </Link>
    );
  }

  const petData = pet;
  const needsCare = petData.status !== "ok" || petData.bond < 50;

  function quick(type: PetActionType) {
    if (care.isPending) return;
    vibrate(20);
    playSound(type === "feed" ? "meow" : "purr");
    setReaction({ id: Date.now(), emoji: reactionEmoji(type) });
    care.mutate(type, { onError: (e) => toast.error((e as Error).message) });
  }

  return (
    <Card className="flex items-center gap-3">
      <Link href="/pet" className="shrink-0">
        <PetAvatar pet={petData} reaction={reaction} size={72} />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate font-display font-semibold">
          {petData.name}
          {needsCare && (
            <span className="inline-block size-2 shrink-0 rounded-full bg-primary" />
          )}
        </p>
        <p className="truncate text-sm text-muted">
          {t(`status.${petData.status}`)} · ❤️ {petData.bond}
        </p>
      </div>
      {petData.status !== "away" && (
        <div className="flex shrink-0 gap-1.5">
          <button
            onClick={() => quick("feed")}
            disabled={care.isPending}
            aria-busy={care.isPending || undefined}
            className="flex size-11 items-center justify-center rounded-cute bg-surface-muted text-xl disabled:opacity-40"
            aria-label={t("actions.feed")}
          >
            {care.isPending ? <Spinner size="sm" /> : "🍚"}
          </button>
          <button
            onClick={() => quick("pet")}
            disabled={care.isPending}
            aria-busy={care.isPending || undefined}
            className="flex size-11 items-center justify-center rounded-cute bg-surface-muted text-xl disabled:opacity-40"
            aria-label={t("actions.pet")}
          >
            {care.isPending ? <Spinner size="sm" /> : "❤️"}
          </button>
        </div>
      )}
    </Card>
  );
}
