"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { accentHex } from "@/lib/avatars";
import { useCouple } from "@/components/providers/couple-provider";
import { useOpenLoveNote } from "@/hooks/use-love-notes";
import { springBouncy, springSoft } from "@/lib/motion";
import { vibrate } from "@/lib/feedback";
import type { LoveNote } from "@/lib/supabase/types";

interface NoteLightboxProps {
  note: LoveNote | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NoteLightbox({ note, isOpen, onClose }: NoteLightboxProps) {
  const t = useTranslations("notes");
  const { me, partner } = useCouple();
  const openNote = useOpenLoveNote();
  const [flipped, setFlipped] = useState(false);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    setFlipped(false);
    setArchiving(false);
  }, [note?.id]);

  if (!note) return null;

  const authorName =
    note.author_id === me.id ? me.display_name : partner?.display_name;

  function handleFlip() {
    if (flipped || archiving) return;
    setFlipped(true);
    vibrate(10);
  }

  function handleArchive() {
    if (archiving || !note) return;
    setArchiving(true);
    vibrate(20);
    openNote.mutate(
      { noteId: note.id, input: { opened_at: new Date().toISOString() } },
      { onSettled: () => onClose() },
    );
  }

  function handleOverlayClick() {
    if (!flipped || archiving) return;
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="lightbox-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black p-6"
        >
          <motion.div
            key="lightbox-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              archiving
                ? { opacity: 0, x: "100%", scale: 0.9 }
                : { opacity: 1, scale: 1, x: 0 }
            }
            exit={{ opacity: 0, scale: 0.8 }}
            transition={archiving ? { duration: 0.4, ease: "easeIn" } : springBouncy}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-sm flex-col items-center"
          >
            {/* Card with flip */}
            <div
              className="relative h-72 w-full cursor-pointer"
              style={{ perspective: 1200 }}
              onClick={handleFlip}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={springSoft}
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front face — sealed envelope */}
                <motion.div
                  animate={{ opacity: flipped ? 0 : 1 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-cute shadow-soft"
                  style={{
                    backgroundColor: `${accentHex(note.accent)}55`,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <span className="text-6xl">💌</span>
                  <p className="px-6 text-center text-sm font-semibold text-white/80">
                    {note.author_id === me.id
                      ? t("youWroteNote")
                      : t("partnerWroteNote", { name: authorName ?? "💕" })}
                  </p>
                  <p className="text-xs text-white/40">{t("tapToReveal")}</p>
                </motion.div>

                {/* Back face — revealed message */}
                <motion.div
                  animate={{ opacity: flipped ? 1 : 0 }}
                  transition={{ duration: 0.15, delay: flipped ? 0.2 : 0 }}
                  className="absolute inset-0 flex flex-col gap-3 rounded-cute p-5 shadow-soft"
                  style={{
                    backgroundColor: `${accentHex(note.accent)}55`,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <p className="flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/90">
                    {note.body}
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>{authorName ?? "💕"}</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Archive button — always in DOM, visibility toggled to avoid layout shift */}
            <div className="mt-4 flex h-12 items-center justify-center">
              <motion.button
                type="button"
                initial={false}
                animate={{
                  opacity: flipped && !archiving ? 1 : 0,
                  y: flipped && !archiving ? 0 : 8,
                  pointerEvents: flipped && !archiving ? "auto" : "none",
                }}
                transition={springBouncy}
                onClick={handleArchive}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-soft"
              >
                {t("archive")}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
