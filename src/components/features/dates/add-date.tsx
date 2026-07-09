"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DATE_KINDS, type DateKind } from "@/lib/schemas/special-date";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { Switch } from "@/components/ui/switch";
import { useAddSpecialDate } from "@/hooks/use-special-dates";

const EMOJIS = ["🎉", "💍", "🎂", "❤️", "🌹", "✈️", "🏡", "⭐", "🥂", "🐣"];

export function AddDate() {
  const t = useTranslations("dates");
  const tc = useTranslations("common");
  const add = useAddSpecialDate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [kind, setKind] = useState<DateKind>("anniversary");
  const [recurring, setRecurring] = useState(true);
  const [emoji, setEmoji] = useState("🎉");

  function save() {
    if (!title.trim() || !date || add.isPending) return;
    add.mutate({ id: crypto.randomUUID(), title: title.trim(), date, kind, recurring, emoji });
    setTitle("");
    setDate("");
    setKind("anniversary");
    setRecurring(true);
    setEmoji("🎉");
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
          maxLength={60}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className="h-12 w-full rounded-cute bg-surface-muted px-4 outline-none placeholder:text-muted/60"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-12 w-full rounded-cute bg-surface-muted px-4 outline-none"
        />
        <SegmentedToggle
          value={kind}
          onChange={(v) => setKind(v)}
          options={DATE_KINDS.map((k) => ({ value: k, label: t(`kind.${k}`) }))}
        />
        <label className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted">{t("recurring")}</span>
          <Switch checked={recurring} onChange={setRecurring} />
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={cn(
                "flex size-11 items-center justify-center rounded-cute bg-surface-muted text-2xl",
                emoji === e && "ring-2 ring-primary",
              )}
            >
              {e}
            </button>
          ))}
        </div>
        <Button onClick={save} disabled={!title.trim() || !date} loading={add.isPending} className="w-full">
          {tc("save")}
        </Button>
      </div>
    </Sheet>
  );
}
