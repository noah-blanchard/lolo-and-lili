"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { useCouple } from "@/components/providers/couple-provider";
import { useAddIngredients, useDeleteMeal, useUpsertMeal } from "@/hooks/use-meals";
import type { MealSlot } from "@/lib/schemas/meal";
import type { Meal } from "@/lib/supabase/types";

export function MealEditor({
  date,
  slot,
  meal,
  open,
  onOpenChange,
}: {
  date: string;
  slot: MealSlot;
  meal: Meal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("meals");
  const tc = useTranslations("common");
  const { me, partner } = useCouple();
  const upsert = useUpsertMeal();
  const del = useDeleteMeal();
  const addIng = useAddIngredients();

  const [title, setTitle] = useState(meal?.title ?? "");
  const [cook, setCook] = useState<string>(meal?.cook_id ?? "none");
  const [notes, setNotes] = useState(meal?.notes ?? "");
  const [ingredients, setIngredients] = useState("");

  // Reset the form from the row whenever the sheet (re)opens — done in the
  // event handler, not an effect.
  function handleOpen(next: boolean) {
    if (next) {
      setTitle(meal?.title ?? "");
      setCook(meal?.cook_id ?? "none");
      setNotes(meal?.notes ?? "");
      setIngredients("");
    }
    onOpenChange(next);
  }

  function save() {
    if (!title.trim() || upsert.isPending) return;
    upsert.mutate({
      date,
      slot,
      title: title.trim(),
      cook_id: cook === "none" ? null : cook,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  }

  function pushIngredients() {
    const items = ingredients
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!items.length) return;
    addIng.mutate(items, {
      onSuccess: () => {
        toast.success(t("ingredientsAdded"));
        setIngredients("");
      },
    });
  }

  const cookOptions = [
    { value: "none", label: t("cookNone") },
    { value: me.id, label: me.display_name ?? t("cookMe") },
    ...(partner ? [{ value: partner.id, label: partner.display_name ?? t("cookPartner") }] : []),
  ];

  return (
    <Sheet open={open} onOpenChange={handleOpen} title={t(`slots.${slot}`)}>
      <div className="flex flex-col gap-4 pt-2">
        <input
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("mealPlaceholder")}
          className="h-12 w-full rounded-cute bg-surface-muted px-4 outline-none placeholder:text-muted/60"
        />
        <div className="flex flex-col gap-1.5">
          <span className="px-1 text-sm font-semibold text-muted">{t("cook")}</span>
          <SegmentedToggle value={cook} onChange={setCook} options={cookOptions} />
        </div>
        <textarea
          value={notes}
          maxLength={280}
          rows={2}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
          className="w-full resize-none rounded-cute bg-surface-muted p-3 outline-none placeholder:text-muted/60"
        />
        <Button onClick={save} disabled={!title.trim() || upsert.isPending} className="w-full">
          {tc("save")}
        </Button>
        {meal && (
          <Button
            variant="ghost"
            onClick={() => {
              del.mutate(meal.id);
              onOpenChange(false);
            }}
            className="w-full text-busy"
          >
            {t("deleteMeal")}
          </Button>
        )}

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-sm font-semibold text-muted">{t("ingredientsTitle")}</span>
          <textarea
            value={ingredients}
            rows={2}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={t("ingredientsPlaceholder")}
            className="w-full resize-none rounded-cute bg-surface-muted p-3 outline-none placeholder:text-muted/60"
          />
          <Button
            variant="secondary"
            onClick={pushIngredients}
            disabled={!ingredients.trim() || addIng.isPending}
            className="w-full"
          >
            {t("addIngredients")}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
