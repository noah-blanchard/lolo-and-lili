"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useLoveNotes } from "@/hooks/use-love-notes";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { staggerContainer, popIn } from "@/lib/motion";
import { NoteCard } from "./note-card";
import type { LoveNote } from "@/lib/supabase/types";

interface NotesGridProps {
  /** Filter function applied to the full notes list. */
  filter: (note: LoveNote) => boolean;
  onSelect: (noteId: string) => void;
}

export function NotesGrid({ filter, onSelect }: NotesGridProps) {
  const t = useTranslations("notes");
  const { data: notes, isLoading } = useLoveNotes();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-cute bg-surface p-4 shadow-soft">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="mt-auto flex items-center justify-between pt-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filtered = (notes ?? []).filter(filter);

  if (!filtered.length) {
    return (
      <EmptyState
        emoji="💌"
        title={t("empty")}
        description={t("emptyHint")}
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-3"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {filtered.map((note) => (
          <motion.div key={note.id} variants={popIn} exit="exit" layout>
            <NoteCard note={note} onClick={() => onSelect(note.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
