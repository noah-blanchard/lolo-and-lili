"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Dices } from "lucide-react";
import { celebrate } from "@/lib/confetti";
import { vibrate } from "@/lib/feedback";
import { springBouncy, tapScale } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBucket } from "@/hooks/use-bucket";

export function SpinJar() {
  const t = useTranslations("bucket");
  const { data } = useBucket();
  const [picked, setPicked] = useState<string | null>(null);
  const [reel, setReel] = useState<string[] | null>(null);
  const spinning = useRef(false);
  const pending = (data ?? []).filter((i) => !i.done);

  function spin() {
    if (!pending.length || spinning.current) return;
    spinning.current = true;
    const choice = pending[Math.floor(Math.random() * pending.length)];

    // Build a reel that blurs past several random titles and lands on the winner.
    const filler = Array.from({ length: 14 }, () => {
      return pending[Math.floor(Math.random() * pending.length)].title;
    });
    setReel([...filler, choice.title]);
    setPicked(null);
    vibrate(10);

    // Reveal the winner once the reel finishes decelerating.
    window.setTimeout(() => {
      setReel(null);
      setPicked(choice.title);
      celebrate();
      vibrate([10, 30, 10]);
      spinning.current = false;
    }, 1150);
  }

  const cellHeight = 44; // px per reel row

  return (
    <div className="flex flex-col gap-3">
      <motion.div whileTap={pending.length ? tapScale : undefined} transition={springBouncy}>
        <Button
          onClick={spin}
          disabled={!pending.length || !!reel}
          variant="secondary"
          className="w-full gap-2"
        >
          <motion.span
            animate={reel ? { rotate: [0, -20, 20, -12, 0] } : { rotate: 0 }}
            transition={{ duration: 0.5, repeat: reel ? Infinity : 0 }}
          >
            <Dices className="size-5" />
          </motion.span>
          {t("spin")}
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {reel && (
          <motion.div
            key="reel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden rounded-cute bg-primary/10"
            style={{ height: cellHeight }}
          >
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: -(reel.length - 1) * cellHeight }}
              transition={{ duration: 1.1, ease: [0.15, 0.6, 0.2, 1] }}
            >
              {reel.map((title, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center px-4 font-display font-semibold"
                  style={{ height: cellHeight }}
                >
                  <span className="truncate">{title}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {picked && !reel && (
          <motion.div
            key={picked}
            initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
            animate={{ opacity: 1, scale: [0.7, 1.08, 1], rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={springBouncy}
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
