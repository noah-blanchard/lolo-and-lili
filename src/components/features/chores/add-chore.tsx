"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SegmentedToggle, type SegmentOption } from "@/components/ui/segmented-toggle";
import { useCreateChore } from "@/hooks/use-chores";
import { useCouple } from "@/components/providers/couple-provider";
import { recurrences, type Recurrence } from "@/lib/chores";
import { cn } from "@/lib/utils";

const ANYONE = "anyone";

export function AddChore() {
  const t = useTranslations("chores");
  const create = useCreateChore();
  const { me, partner } = useCouple();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<string>(ANYONE);
  const [recurrence, setRecurrence] = useState<Recurrence>("none");

  const recurrenceLabel: Record<Recurrence, string> = {
    none: t("recurrenceNone"),
    daily: t("recurrenceDaily"),
    weekly: t("recurrenceWeekly"),
    monthly: t("recurrenceMonthly"),
  };

  const assigneeOptions: SegmentOption<string>[] = [
    { value: ANYONE, label: t("assigneeAnyone") },
    { value: me.id, label: me.avatar_emoji ?? me.display_name ?? "🐣" },
    ...(partner
      ? [
          {
            value: partner.id,
            label: partner.avatar_emoji ?? partner.display_name ?? "💕",
          },
        ]
      : []),
  ];

  function submit() {
    if (!title.trim() || create.isPending) return;
    create.mutate({
      id: crypto.randomUUID(),
      title: title.trim(),
      assignee_id: assignee === ANYONE ? null : assignee,
      recurrence,
      points: 1,
      due_date: null,
    });
    setTitle("");
    setAssignee(ANYONE);
    setRecurrence("none");
    setOpen(false);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title={t("addTitle")}
      trigger={
        <Button className="w-full">
          <Plus className="size-5" /> {t("add")}
        </Button>
      }
    >
      <div className="flex flex-col gap-4 pt-2">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t("titlePlaceholder")}
          className="h-12 w-full rounded-cute bg-surface-muted px-4 outline-none placeholder:text-muted/60"
        />

        <div className="flex flex-col gap-1.5">
          <span className="px-1 text-sm font-semibold text-muted">
            {t("assignee")}
          </span>
          <SegmentedToggle
            value={assignee}
            onChange={setAssignee}
            options={assigneeOptions}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="px-1 text-sm font-semibold text-muted">
            {t("recurrence")}
          </span>
          <div className="flex flex-wrap gap-2">
            {recurrences.map((r) => (
              <button
                key={r}
                onClick={() => setRecurrence(r)}
                className={cn(
                  "rounded-cute px-4 py-2 text-sm font-semibold transition-colors",
                  recurrence === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-muted text-muted",
                )}
              >
                {recurrenceLabel[r]}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={submit} disabled={!title.trim()} loading={create.isPending} className="w-full">
          {t("save")}
        </Button>
      </div>
    </Sheet>
  );
}
