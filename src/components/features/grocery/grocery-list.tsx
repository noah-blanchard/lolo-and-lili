"use client";

import { useTranslations } from "next-intl";
import { celebrate } from "@/lib/confetti";
import { useClearChecked, useGrocery } from "@/hooks/use-grocery";
import { EmptyState } from "@/components/ui/empty-state";
import { AddGrocery } from "./add-grocery";
import { GroceryItem } from "./grocery-item";

export function GroceryList() {
  const t = useTranslations("grocery");
  const { data, isLoading } = useGrocery();
  const clear = useClearChecked();
  const unchecked = (data ?? []).filter((i) => !i.checked);
  const checked = (data ?? []).filter((i) => i.checked);

  function onClear() {
    celebrate();
    clear.mutate();
  }

  return (
    <div className="flex flex-col gap-5">
      <AddGrocery />

      {isLoading ? null : !data?.length ? (
        <EmptyState emoji="🛒" title={t("empty")} description={t("emptyHint")} />
      ) : (
        <div className="flex flex-col gap-3">
          {unchecked.map((i) => (
            <GroceryItem key={i.id} item={i} />
          ))}
          {checked.length > 0 && (
            <>
              <div className="flex items-center justify-between px-1 pt-2">
                <h2 className="text-sm font-semibold text-muted">{t("checkedTitle")}</h2>
                <button
                  type="button"
                  onClick={onClear}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {t("clear")}
                </button>
              </div>
              {checked.map((i) => (
                <GroceryItem key={i.id} item={i} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
