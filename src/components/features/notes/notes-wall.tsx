"use client";

import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { accentHex } from "@/lib/avatars";
import { timeAgo } from "@/lib/dates";
import { useCouple } from "@/components/providers/couple-provider";
import { useDeleteLoveNote, useLoveNotes } from "@/hooks/use-love-notes";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export function NotesWall() {
  const t = useTranslations("notes");
  const locale = useLocale();
  const { me, partner } = useCouple();
  const { data: notes, isLoading } = useLoveNotes();
  const del = useDeleteLoveNote();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
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
  if (!notes?.length)
    return <EmptyState emoji="💌" title={t("empty")} description={t("emptyHint")} />;

  const nameOf = (authorId: string | null) =>
    authorId === me.id ? me.display_name : partner?.display_name;

  return (
    <div className="grid grid-cols-2 gap-3">
      <AnimatePresence>
        {notes.map((note) => (
          <motion.div
            key={note.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative flex flex-col gap-2 rounded-cute p-4 shadow-soft"
            style={{ backgroundColor: `${accentHex(note.accent)}33` }}
          >
            <p className="whitespace-pre-wrap break-words text-sm">{note.body}</p>
            <div className="mt-auto flex items-center justify-between pt-1 text-xs text-muted">
              <span>{nameOf(note.author_id) ?? "💕"}</span>
              <span>{timeAgo(note.created_at, locale)}</span>
            </div>
            {note.author_id === me.id && (
              <button
                type="button"
                aria-label={t("delete")}
                onClick={() => del.mutate(note.id)}
                className="absolute right-2 top-2 text-muted/60 transition-colors hover:text-busy"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
