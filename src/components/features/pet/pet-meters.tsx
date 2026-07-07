"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { METERS, type PetView } from "@/lib/pets";

const METER_COLOR: Record<string, string> = {
  hunger: "#ffb38f",
  affection: "#ff8fa3",
  energy: "#9ee6cf",
  cleanliness: "#8fbcff",
};

export function PetMeters({ pet }: { pet: PetView }) {
  const t = useTranslations("pet");
  return (
    <div className="flex flex-col gap-2.5">
      {METERS.map(({ key, emoji }) => {
        const val = Math.round(pet.meters[key]);
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="w-6 text-center text-lg">{emoji}</span>
            <span className="w-20 text-sm font-semibold text-muted">
              {t(`meters.${key}`)}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: METER_COLOR[key] }}
                animate={{ width: `${val}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            <span className="w-8 text-right text-xs font-semibold text-muted">
              {val}
            </span>
          </div>
        );
      })}
    </div>
  );
}
