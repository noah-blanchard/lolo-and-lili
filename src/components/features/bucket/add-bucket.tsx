"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAddBucket } from "@/hooks/use-bucket";

export function AddBucket() {
  const t = useTranslations("bucket");
  const tc = useTranslations("common");
  const add = useAddBucket();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  function save() {
    if (!title.trim() || add.isPending) return;
    add.mutate({
      id: crypto.randomUUID(),
      title: title.trim(),
      note: note.trim() || undefined,
    });
    setTitle("");
    setNote("");
    setOpen(false);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title={t("addTitle")}
      trigger={
        <Button className="w-full gap-2">
          <Plus className="size-5" />
          {t("add")}
        </Button>
      }
    >
      <div className="flex flex-col gap-4 pt-2">
        <input
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className="h-12 w-full rounded-cute bg-surface-muted px-4 outline-none placeholder:text-muted/60"
        />
        <textarea
          value={note}
          maxLength={280}
          rows={2}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("notePlaceholder")}
          className="w-full resize-none rounded-cute bg-surface-muted p-3 outline-none placeholder:text-muted/60"
        />
        <Button onClick={save} disabled={!title.trim()} loading={add.isPending} className="w-full">
          {tc("save")}
        </Button>
      </div>
    </Sheet>
  );
}
