"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { usePet, useCarePet } from "@/hooks/use-pet";
import { reactionEmoji, type PetActionType } from "@/lib/pets";
import { celebrate } from "@/lib/confetti";
import { playSound, vibrate, setMuted } from "@/lib/feedback";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PetAvatar } from "./pet-avatar";
import { PetMeters } from "./pet-meters";
import { PetActions } from "./pet-actions";
import { PetWalkOverlay } from "./pet-walk-overlay";
import { PetCloset } from "./pet-closet";
import { PetAdopt } from "./pet-adopt";
import { PetMemories } from "./pet-memories";
import { usePartnerCare } from "./use-pet-realtime";

export function PetScreen() {
  const t = useTranslations("pet");
  const ta = useTranslations("a11y");
  const { data: pet, isLoading } = usePet();
  const care = useCarePet();
  const [reaction, setReaction] = useState<{ id: number; emoji: string } | null>(
    null,
  );
  const [muted, setMutedState] = useState(false);
  const [walkOpen, setWalkOpen] = useState(false);

  usePartnerCare((type) => {
    setReaction({ id: Date.now(), emoji: reactionEmoji(type as PetActionType) });
    toast(t("partnerCared"));
  });

  const react = (emoji: string) => setReaction({ id: Date.now(), emoji });

  if (isLoading) {
    return <p className="pt-10 text-center text-muted">…</p>;
  }

  if (!pet) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
        <PetAdopt />
      </div>
    );
  }

  const petData = pet;

  function cuddle() {
    if (care.isPending || petData.cuddledToday) return;
    vibrate(20);
    playSound("purr");
    react("💕");
    care.mutate("cuddle", {
      onSuccess: (res) => {
        for (const ev of res.events) {
          if (ev.kind === "streak") {
            celebrate();
            toast.success(t("streakReached", { count: ev.value ?? "" }));
          }
        }
      },
      onError: (e) => toast.error((e as Error).message),
    });
  }

  function callBack() {
    if (care.isPending) return;
    vibrate(30);
    react("🏡");
    care.mutate("callback", {
      onSuccess: (res) => {
        if (res.events.some((e) => e.kind === "recovered")) {
          celebrate();
          toast.success(t("cameHome", { name: petData.name }));
        } else {
          toast(t("callbackWaiting"));
        }
      },
      onError: (e) => toast.error((e as Error).message),
    });
  }

  // Fired when the poop is cleaned in the walk overlay — resets the bladder.
  function walkDone() {
    playSound("purr");
    react("🌿");
    care.mutate("walk", {
      onSuccess: (res) => {
        for (const ev of res.events) {
          if (ev.kind === "levelUp") {
            celebrate();
            toast.success(t("leveledUp", { level: ev.value ?? "" }));
          } else if (ev.kind === "stageUp") {
            celebrate();
            toast.success(t("grewUp", { name: petData.name }));
          }
        }
      },
      onError: (e) => toast.error((e as Error).message),
    });
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-1 pt-2">
        <h1 className="truncate font-display text-3xl font-bold">{petData.name}</h1>
        <button onClick={toggleMute} className="text-xl" aria-label={ta("mute")}>
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <Card className="flex flex-col items-center gap-3">
        <PetAvatar pet={petData} reaction={reaction} size={168} />
        <p className="text-center text-sm font-semibold text-muted">
          {t(`status.${petData.status}`)} · ❤️ {petData.bond} · Lv.{petData.level}{" "}
          · 🔥 {petData.streak_count} · 🪙 {petData.treats}
        </p>
      </Card>

      {petData.status === "away" ? (
        <Card className="flex flex-col items-center gap-3 text-center">
          <CardTitle>{t("awayTitle")}</CardTitle>
          <CardDescription>{t("awaySubtitle")}</CardDescription>
          <Button onClick={callBack} loading={care.isPending} className="w-full">
            {t("callBack")}
          </Button>
        </Card>
      ) : (
        <>
          <Card className="flex flex-col gap-4">
            <CardTitle>{t("careTitle")}</CardTitle>
            <PetMeters pet={petData} />
            <PetActions
              pet={petData}
              onReaction={react}
              onWalk={() => setWalkOpen(true)}
            />
          </Card>

          <Card className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle>{t("cuddleTitle")}</CardTitle>
              <CardDescription>
                {petData.cuddledToday
                  ? petData.partnerCuddledToday
                    ? t("cuddleDone")
                    : t("cuddleWaiting")
                  : t("cuddleHint")}
              </CardDescription>
            </div>
            <Button
              onClick={cuddle}
              disabled={petData.cuddledToday}
              loading={care.isPending}
              variant="secondary"
              size="icon"
              aria-label={t("cuddleTitle")}
            >
              🤍
            </Button>
          </Card>

          <PetCloset pet={petData} />
        </>
      )}

      <PetMemories />

      <PetWalkOverlay
        open={walkOpen}
        pet={petData}
        onCleaned={walkDone}
        onClose={() => setWalkOpen(false)}
      />
    </div>
  );
}
