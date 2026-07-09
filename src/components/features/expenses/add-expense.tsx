"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENCIES, type Currency } from "@/lib/schemas/expense";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAddExpense } from "@/hooks/use-expenses";

export function AddExpense() {
  const t = useTranslations("expenses");
  const tc = useTranslations("common");
  const add = useAddExpense();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState<Currency>("EUR");

  const value = Number(amount.replace(",", "."));
  const valid = value > 0 && description.trim().length > 0;

  function save() {
    if (!valid || add.isPending) return;
    add.mutate({
      id: crypto.randomUUID(),
      amount: value,
      description: description.trim(),
      currency,
    });
    setAmount("");
    setDescription("");
    setCurrency("EUR");
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
          value={description}
          maxLength={120}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descPlaceholder")}
          className="h-12 w-full rounded-cute bg-surface-muted px-4 outline-none placeholder:text-muted/60"
        />
        <div className="flex gap-2">
          <input
            value={amount}
            inputMode="decimal"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-12 flex-1 rounded-cute bg-surface-muted px-4 text-right outline-none placeholder:text-muted/60"
          />
          <div className="flex flex-wrap gap-1">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={cn(
                  "rounded-cute bg-surface-muted px-2.5 text-sm font-semibold",
                  currency === c && "bg-primary text-primary-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={save} disabled={!valid} loading={add.isPending} className="w-full">
          {tc("save")}
        </Button>
      </div>
    </Sheet>
  );
}
