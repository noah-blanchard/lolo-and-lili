"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { accentHex } from "@/lib/avatars";
import { useCouple } from "@/components/providers/couple-provider";
import { useOpenLoveNote } from "@/hooks/use-love-notes";
import { springBouncy, springSoft } from "@/lib/motion";
import { vibrate } from "@/lib/feedback";
import type { LoveNote } from "@/lib/supabase/types";

interface NoteLightboxProps {
  note: LoveNote;
  isOpen: boolean;
  onClose: () => void;
}

export function NoteLightbox({ note, isOpen, onClose }: NoteLightboxProps) {
  const t = useTranslations("notes");
  const { me, partner } = useCouple();
  const openNote = useOpenLoveNote();
  const [flipped, setFlipped] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const authorName =
    note.author_id === me.id ? me.display_name : partner?.display_name;

  function handleFlip() {
    if (flipped || archiving) return;
    setFlipped(true);
    vibrate(10);
  }

  function handleArchive() {
    if (archiving) return;
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
          transition={{ duration: 0.25 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
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
            className="flex w-full max-w-sm flex-col items-center gap-4"
          >
            {/* Card with flip */}
            <div
              className="relative h-72 w-full cursor-pointer"
              style={{ perspective: 1000 }}
              onClick={handleFlip}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={springSoft}
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front face — sealed envelope */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-cute shadow-soft"
                  style={{
                    backgroundColor: `${accentHex(note.accent)}33`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <span className="text-6xl">💌</span>
                  <p className="px-6 text-center text-sm font-semibold text-muted">
                    {note.author_id === me.id
                      ? t("youWroteNote")
                      : t("partnerWroteNote", { name: authorName ?? "💕" })}
                  </p>
                  <p className="text-xs text-muted/60">{t("tapToReveal")}</p>
                </div>

                {/* Back face — revealed message */}
                <div
                  className="absolute inset-0 flex flex-col gap-3 rounded-cute p-5 shadow-soft"
                  style={{
                    backgroundColor: `${accentHex(note.accent)}33`,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <p className="flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {note.body}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{authorName ?? "💕"}</span>
                    <span>{note.created_at}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Archive button — only visible after flip */}
            <AnimatePresence>
              {flipped && !archiving && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={springBouncy}
                  onClick={handleArchive}
                  className="rounded-full bg-surface px-6 py-3 text-sm font-semibold shadow-soft transition-colors hover:bg-surface-muted"
                >
                  {t("archive")}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
