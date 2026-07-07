"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { vibrate } from "@/lib/feedback";
import { Button } from "@/components/ui/button";
import { useSendNudge } from "@/hooks/use-love-notes";
import { NoteComposer } from "./note-composer";
import { NotesWall } from "./notes-wall";
import { FloatingHearts, type FloatingHeartsHandle } from "./floating-hearts";
import { useLoveRealtime } from "./use-love-realtime";

export function NotesBoard() {
  const t = useTranslations("notes");
  const heartsRef = useRef<FloatingHeartsHandle>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const nudge = useSendNudge();

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

  return (
    <div className="flex flex-col gap-5">
      <Button onClick={throwHeart} variant="secondary" className="w-full gap-2">
        <Heart className="size-5" /> {t("sendHeart")}
      </Button>

      <NoteComposer onTyping={setTyping} />

      {partnerTyping && <p className="px-1 text-sm text-muted">{t("typing")}</p>}

      <NotesWall />

      <FloatingHearts ref={heartsRef} />
    </div>
  );
}
