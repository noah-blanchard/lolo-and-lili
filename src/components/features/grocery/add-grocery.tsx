"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddGrocery } from "@/hooks/use-grocery";

export function AddGrocery() {
  const t = useTranslations("grocery");
  const add = useAddGrocery();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    add.mutate({
      id: crypto.randomUUID(),
      name: name.trim(),
      quantity: qty.trim() || undefined,
    });
    setName("");
    setQty("");
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("namePlaceholder")}
        className="h-12 flex-1 rounded-cute bg-surface-muted px-4 outline-none placeholder:text-muted/60"
      />
      <input
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder={t("qty")}
        className="h-12 w-20 rounded-cute bg-surface-muted px-3 text-center outline-none placeholder:text-muted/60"
      />
      <Button type="submit" size="icon" aria-label={t("add")}>
        <Plus className="size-5" />
      </Button>
    </form>
  );
}
