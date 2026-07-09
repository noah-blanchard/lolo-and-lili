"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { toast } from "sonner";
import { MOODS, type MoodKey } from "@/lib/moods";
import { useAddMood } from "@/hooks/use-moods";
import { celebrate } from "@/lib/confetti";
import { Sheet } from "@/components/ui/sheet";
import { springBouncy, tapScale } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface MoodDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoodDrawer({ open, onOpenChange }: MoodDrawerProps) {
  const t = useTranslations("moods");
  const { mutate: addMood } = useAddMood();
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    if (!open) setSelecting(false);
  }, [open]);

  const handleSelectMood = (key: MoodKey) => {
    if (selecting) return;
    setSelecting(true);
    addMood(
      { id: crypto.randomUUID(), mood: key },
      {
        onSuccess: () => {
          celebrate();
          toast.success(t("logged"));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(t("error"));
          setSelecting(false);
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t("question")}>
      <div className="grid grid-cols-3 gap-2 pt-2">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.key}
            type="button"
            whileTap={tapScale}
            transition={springBouncy}
            disabled={selecting}
            className={cn(
              "flex flex-col items-center gap-1 rounded-cute bg-surface-muted py-3",
              "transition-colors hover:bg-surface active:bg-primary/10",
              selecting && "pointer-events-none opacity-50",
            )}
            onClick={() => handleSelectMood(mood.key)}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className="text-[0.65rem] font-semibold text-muted">
              {t(`faces.${mood.key}`)}
            </span>
          </motion.button>
        ))}
      </div>
    </Sheet>
  );
}
