"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Dices } from "lucide-react";
import { celebrate } from "@/lib/confetti";
import { vibrate } from "@/lib/feedback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBucket } from "@/hooks/use-bucket";

export function SpinJar() {
  const t = useTranslations("bucket");
  const { data } = useBucket();
  const [picked, setPicked] = useState<string | null>(null);
  const pending = (data ?? []).filter((i) => !i.done);

  function spin() {
    if (!pending.length) return;
    const choice = pending[Math.floor(Math.random() * pending.length)];
    setPicked(choice.title);
    celebrate();
    vibrate([10, 30, 10]);
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={spin}
        disabled={!pending.length}
        variant="secondary"
        className="w-full gap-2"
      >
        <Dices className="size-5" />
        {t("spin")}
      </Button>
      <AnimatePresence mode="wait">
        {picked && (
          <motion.div
            key={picked}
            initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="bg-primary/10 text-center">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t("tonight")}
              </span>
              <p className="pt-1 font-display text-xl font-semibold">{picked}</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
