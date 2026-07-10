"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { toast } from "sonner";
import { MOODS, type MoodKey } from "@/lib/moods";
import { useAddMood } from "@/hooks/use-moods";
import { celebrate } from "@/lib/confetti";
import { Sheet } from "@/components/ui/sheet";
import { keyframePop, springBouncy, tapScale } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface MoodDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoodDrawer({ open, onOpenChange }: MoodDrawerProps) {
  const t = useTranslations("moods");
  const { mutate: addMood } = useAddMood();
  const [selecting, setSelecting] = useState(false);
  const [chosen, setChosen] = useState<MoodKey | null>(null);

  // Reset the submitting guard whenever the drawer closes. Adjusting state during
  // render (tracking the previous `open`) is React's supported alternative to a
  // setState-in-effect here.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setSelecting(false);
      setChosen(null);
    }
  }

  const handleSelectMood = (key: MoodKey) => {
    if (selecting) return;
    setSelecting(true);
    setChosen(key);
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
            <motion.span
              className="text-3xl"
              animate={
                chosen === mood.key
                  ? { scale: [1, 1.4, 0.9], y: [0, -10, -4] }
                  : { scale: 1, y: 0 }
              }
              // Keyframe arrays can't use a spring (two-keyframe limit); the pop
              // rides the timed keyframePop tween, the reset springs back to rest.
              transition={chosen === mood.key ? keyframePop : springBouncy}
            >
              {mood.emoji}
            </motion.span>
            <span className="text-[0.65rem] font-semibold text-muted">
              {t(`faces.${mood.key}`)}
            </span>
          </motion.button>
        ))}
      </div>
    </Sheet>
  );
}
