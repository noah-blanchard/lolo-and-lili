"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { toast } from "sonner";
import { MOODS, type MoodKey } from "@/lib/moods";
import { useAddMood } from "@/hooks/use-moods";
import { celebrate } from "@/lib/confetti";
import { Card, CardTitle } from "@/components/ui/card";
import { springBouncy, tapScale } from "@/lib/motion";

export function MoodPicker() {
  const t = useTranslations("moods");
  const addMood = useAddMood();

  function pick(mood: MoodKey) {
    addMood.mutate({ mood });
    celebrate();
    toast.success(t("logged"));
  }

  return (
    <Card className="flex flex-col gap-4">
      <CardTitle>{t("question")}</CardTitle>
      <div className="grid grid-cols-4 gap-2">
        {MOODS.map(({ key, emoji }) => (
          <motion.button
            key={key}
            whileTap={tapScale}
            transition={springBouncy}
            onClick={() => pick(key)}
            className="flex flex-col items-center gap-1 rounded-cute bg-surface-muted py-3"
          >
            <span className="text-3xl">{emoji}</span>
            <span className="text-[0.65rem] font-semibold text-muted">
              {t(`faces.${key}`)}
            </span>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}
