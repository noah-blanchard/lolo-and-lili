"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ACCENTS, type AccentKey } from "@/lib/avatars";
import { celebrate } from "@/lib/confetti";
import { vibrate } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAddLoveNote } from "@/hooks/use-love-notes";

export function NoteComposer({ onTyping }: { onTyping?: (t: boolean) => void }) {
  const t = useTranslations("notes");
  const add = useAddLoveNote();
  const [body, setBody] = useState("");
  const [accent, setAccent] = useState<AccentKey>("coral");

  function send() {
    const text = body.trim();
    if (!text || add.isPending) return;
    onTyping?.(false);
    add.mutate({ id: crypto.randomUUID(), body: text, accent });
    setBody("");
    celebrate();
    vibrate(20);
  }

  return (
    <Card className="flex flex-col gap-3">
      <textarea
        value={body}
        maxLength={280}
        rows={3}
        onChange={(e) => setBody(e.target.value)}
        onFocus={() => onTyping?.(true)}
        onBlur={() => onTyping?.(false)}
        placeholder={t("placeholder")}
        className="w-full resize-none rounded-cute bg-surface-muted p-3 outline-none placeholder:text-muted/60"
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {ACCENTS.map((a) => (
            <button
              key={a.key}
              type="button"
              aria-label={a.key}
              onClick={() => setAccent(a.key)}
              className={cn(
                "size-6 rounded-full transition",
                accent === a.key && "ring-2 ring-foreground/40 ring-offset-2",
              )}
              style={{ backgroundColor: a.hex }}
            />
          ))}
        </div>
        <Button size="sm" onClick={send} disabled={!body.trim()} loading={add.isPending}>
          {t("send")}
        </Button>
      </div>
    </Card>
  );
}
