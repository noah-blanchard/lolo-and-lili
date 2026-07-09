"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useCarePet } from "@/hooks/use-pet";
import { TREAT_COST, reactionEmoji, type PetView } from "@/lib/pets";
import { celebrate } from "@/lib/confetti";
import { playSound, vibrate } from "@/lib/feedback";
import { tapScale, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

/** The six actions surfaced in the grid (cuddle/callback live elsewhere). */
type CareActionType = "feed" | "pet" | "play" | "groom" | "gift" | "heal";

interface ActionDef {
  type: CareActionType;
  emoji: string;
  sound: string;
  cost?: number;
  sickOnly?: boolean;
}

const ACTIONS: ActionDef[] = [
  { type: "feed", emoji: "🍚", sound: "meow" },
  { type: "pet", emoji: "❤️", sound: "purr" },
  { type: "play", emoji: "🧶", sound: "meow" },
  { type: "groom", emoji: "🧼", sound: "purr" },
  { type: "gift", emoji: "🎁", sound: "purr", cost: TREAT_COST.gift },
  { type: "heal", emoji: "🩹", sound: "meow", cost: TREAT_COST.heal, sickOnly: true },
];

export function PetActions({
  pet,
  onReaction,
}: {
  pet: PetView;
  onReaction: (emoji: string) => void;
}) {
  const t = useTranslations("pet");
  const care = useCarePet();

  function run(def: ActionDef) {
    if (care.isPending) return;
    vibrate(20);
    playSound(def.sound);
    onReaction(reactionEmoji(def.type));
    care.mutate(def.type, {
      onSuccess: (res) => {
        for (const ev of res.events) {
          if (ev.kind === "levelUp") {
            toast.success(t("leveledUp", { level: ev.value ?? "" }));
          } else if (ev.kind === "stageUp") {
            celebrate();
            toast.success(t("grewUp", { name: pet.name }));
          } else if (ev.kind === "unlock") {
            celebrate();
            toast.success(t("unlocked"));
          } else if (ev.kind === "streak") {
            celebrate();
            toast.success(t("streakReached", { count: ev.value ?? "" }));
          }
        }
      },
      onError: (e) => toast.error((e as Error).message),
    });
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {ACTIONS.map((def) => {
        const remaining = pet.cooldowns[def.type] ?? 0;
        const onCooldown = remaining > 0;
        const tooPoor = !!def.cost && pet.treats < def.cost;
        const needsSick = def.sickOnly && pet.status !== "sick";
        const disabled =
          care.isPending || onCooldown || tooPoor || needsSick || pet.status === "away";
        return (
          <motion.button
            key={def.type}
            whileTap={disabled ? undefined : tapScale}
            transition={springBouncy}
            disabled={disabled}
            onClick={() => run(def)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-cute bg-surface-muted py-3",
              "disabled:opacity-40",
            )}
          >
            {care.isPending ? (
              <Spinner size="sm" />
            ) : (
              <span className="text-2xl">{def.emoji}</span>
            )}
            <span className="text-[0.7rem] font-semibold text-muted">
              {t(`actions.${def.type}`)}
            </span>
            {def.cost ? (
              <span className="text-[0.6rem] font-semibold text-primary">
                🪙 {def.cost}
              </span>
            ) : onCooldown ? (
              <span className="text-[0.6rem] text-muted">
                {Math.ceil(remaining / 60000)}m
              </span>
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}
