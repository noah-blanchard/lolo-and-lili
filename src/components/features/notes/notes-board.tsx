"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { vibrate } from "@/lib/feedback";
import { Button } from "@/components/ui/button";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { useCouple } from "@/components/providers/couple-provider";
import { useLoveNotes, useSendNudge } from "@/hooks/use-love-notes";
import { NoteComposer } from "./note-composer";
import { NotesGrid } from "./notes-grid";
import { NoteLightbox } from "./note-lightbox";
import { FloatingHearts, type FloatingHeartsHandle } from "./floating-hearts";
import { useLoveRealtime } from "./use-love-realtime";
import type { LoveNote } from "@/lib/supabase/types";

type NoteTab = "new" | "sent" | "archive";

export function NotesBoard() {
  const t = useTranslations("notes");
  const { me } = useCouple();
  const heartsRef = useRef<FloatingHeartsHandle>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [tab, setTab] = useState<NoteTab>("new");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const nudge = useSendNudge();
  const { data: notes } = useLoveNotes();

  const { sendHeart, setTyping } = useLoveRealtime({
    onHeart: () => heartsRef.current?.burst(),
    onTyping: setPartnerTyping,
  });

  function throwHeart() {
    heartsRef.current?.burst();
    sendHeart();
    vibrate(20);
    nudge.mutate();
  }

  const all = notes ?? [];
  const selectedNote = all.find((n) => n.id === selectedNoteId) ?? null;

  const tabFilters: Record<NoteTab, (n: LoveNote) => boolean> = {
    new: (n) => n.author_id !== me.id && !n.opened_at,
    sent: (n) => n.author_id === me.id,
    archive: (n) => !!n.opened_at,
  };

  return (
    <div className="flex flex-col gap-5">
      <Button onClick={throwHeart} variant="secondary" className="w-full gap-2">
        <Heart className="size-5" /> {t("sendHeart")}
      </Button>

      <NoteComposer onTyping={setTyping} />

      {partnerTyping && <p className="px-1 text-sm text-muted">{t("typing")}</p>}

      <SegmentedToggle<NoteTab>
        value={tab}
        onChange={setTab}
        options={[
          { value: "new", label: t("tabNew") },
          { value: "sent", label: t("tabSent") },
          { value: "archive", label: t("tabArchive") },
        ]}
      />

      <NotesGrid filter={tabFilters[tab]} onSelect={setSelectedNoteId} />

      <NoteLightbox
        note={selectedNote}
        isOpen={!!selectedNoteId}
        onClose={() => setSelectedNoteId(null)}
      />

      <FloatingHearts ref={heartsRef} />
    </div>
  );
}
