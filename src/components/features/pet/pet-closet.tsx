"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useBuyAccessory, useEquip } from "@/hooks/use-pet";
import { ACCESSORIES, type Accessory, type PetView } from "@/lib/pets";
import { celebrate } from "@/lib/confetti";
import { playSound, vibrate } from "@/lib/feedback";
import { tapScale, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

const SLOTS = ["hat", "collar"] as const;

/**
 * The wardrobe: buy accessories with treats, then wear/remove what's owned.
 * Buying auto-equips server-side, so the pet changes the instant you purchase.
 */
export function PetCloset({ pet }: { pet: PetView }) {
  const t = useTranslations("pet");
  const equip = useEquip();
  const buy = useBuyAccessory();

  const unlocked = (pet.unlocked ?? []) as string[];
  const equipped = (pet.equipped ?? {}) as Record<string, string | null>;
  const pending = equip.isPending || buy.isPending;

  function onChip(item: Accessory) {
    if (pending) return;
    const owned = unlocked.includes(item.id);
    const isOn = equipped[item.slot] === item.id;
    vibrate(20);

    if (!owned) {
      if (pet.treats < item.price) return;
      playSound("purr");
      buy.mutate(
        { itemId: item.id },
        {
          onSuccess: () => {
            celebrate();
            toast.success(t("bought", { emoji: item.emoji }));
          },
          onError: (e) => toast.error((e as Error).message),
        },
      );
      return;
    }

    // Owned → toggle: wear it, or take it off if it's already on.
    equip.mutate(
      { slot: item.slot, itemId: isOn ? null : item.id },
      { onError: (e) => toast.error((e as Error).message) },
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <CardTitle>{t("closetTitle")}</CardTitle>
        <CardDescription>{t("closetHint")}</CardDescription>
      </div>

      {SLOTS.map((slot) => (
        <div key={slot} className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t(`slots.${slot}`)}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {ACCESSORIES.filter((a) => a.slot === slot).map((item) => {
              const owned = unlocked.includes(item.id);
              const isOn = equipped[item.slot] === item.id;
              const tooPoor = !owned && pet.treats < item.price;
              const disabled = pending || tooPoor;
              return (
                <motion.button
                  key={item.id}
                  whileTap={disabled ? undefined : tapScale}
                  transition={springBouncy}
                  disabled={disabled}
                  onClick={() => onChip(item)}
                  aria-pressed={isOn}
                  aria-label={owned ? t(isOn ? "remove" : "wear") : t("buy")}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-cute py-3",
                    isOn ? "bg-primary/15 ring-2 ring-primary" : "bg-surface-muted",
                    "disabled:opacity-40",
                  )}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[0.7rem] font-semibold text-muted">
                    {t(`items.${item.id}`)}
                  </span>
                  <span className="text-[0.6rem] font-semibold text-primary">
                    {owned ? t(isOn ? "worn" : "owned") : `🪙 ${item.price}`}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </Card>
  );
}
