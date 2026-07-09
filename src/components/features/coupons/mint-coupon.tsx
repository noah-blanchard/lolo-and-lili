"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useMintCoupon } from "@/hooks/use-coupons";

const EMOJIS = ["🎟️", "☕", "🍫", "🎬", "💆", "🛁", "🍳", "🧹", "🎁", "😴", "🍿", "💐"];

export function MintCoupon() {
  const t = useTranslations("coupons");
  const mint = useMintCoupon();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🎟️");
  const [cost, setCost] = useState(0);

  function save() {
    if (!title.trim() || mint.isPending) return;
    mint.mutate({ id: crypto.randomUUID(), title: title.trim(), emoji, cost_treats: cost });
    setTitle("");
    setEmoji("🎟️");
    setCost(0);
    setOpen(false);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title={t("mintTitle")}
      trigger={
        <Button className="w-full gap-2">
          <Plus className="size-5" />
          {t("mint")}
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
        <label className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted">{t("cost")}</span>
          <input
            type="number"
            min={0}
            max={999}
            value={cost}
            onChange={(e) =>
              setCost(Math.max(0, Math.min(999, Number(e.target.value) || 0)))
            }
            className="h-11 w-24 rounded-cute bg-surface-muted px-3 text-right outline-none"
          />
        </label>
        <Button onClick={save} disabled={!title.trim()} loading={mint.isPending} className="w-full">
          {t("mint")}
        </Button>
      </div>
    </Sheet>
  );
}
