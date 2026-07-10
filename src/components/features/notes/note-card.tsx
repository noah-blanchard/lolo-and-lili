"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { accentHex } from "@/lib/avatars";
import { timeAgo } from "@/lib/dates";
import { useCouple } from "@/components/providers/couple-provider";
import { springBouncy } from "@/lib/motion";
import type { LoveNote } from "@/lib/supabase/types";

interface NoteCardProps {
  note: LoveNote;
  onClick: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const t = useTranslations("notes");
  const locale = useLocale();
  const { me, partner } = useCouple();
  const authorName =
    note.author_id === me.id ? me.display_name : partner?.display_name;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      transition={springBouncy}
      onClick={onClick}
      className="relative flex w-full flex-col gap-2 rounded-cute p-4 text-left shadow-soft"
      style={{ backgroundColor: `${accentHex(note.accent)}33` }}
    >
      <span className="text-2xl">💌</span>
      <p className="line-clamp-2 text-sm font-semibold">
        {note.author_id === me.id ? t("youWrote") : `${authorName} ${t("wrote")}`}
      </p>
      <div className="mt-auto flex items-center justify-between pt-1 text-xs text-muted">
        <span>{authorName ?? "💕"}</span>
        <span>{timeAgo(note.created_at, locale)}</span>
      </div>
    </motion.button>
  );
}
