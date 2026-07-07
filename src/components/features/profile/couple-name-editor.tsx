"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { renameCoupleAction } from "@/app/actions/couples";
import { isOk } from "@/lib/api/result";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function CoupleNameEditor({ coupleName }: { coupleName: string | null }) {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const ta = useTranslations("app");
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState(coupleName ?? "");

  function onOpenChange(next: boolean) {
    if (next) setName(coupleName ?? "");
    setOpen(next);
  }

  async function save() {
    if (pending || !name.trim()) return;
    setPending(true);
    const res = await renameCoupleAction({ name: name.trim() });
    setPending(false);
    if (isOk(res)) {
      router.refresh();
      setOpen(false);
    } else {
      toast.error(res.error.message || tc("error"));
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("spaceName")}
      trigger={
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-cute bg-surface p-5 text-left shadow-soft"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-muted text-2xl">
            🏡
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display font-semibold">
              {coupleName ?? ta("name")}
            </span>
            <span className="block text-sm text-muted">{t("renameSpace")}</span>
          </span>
          <Pencil className="size-5 shrink-0 text-muted" />
        </button>
      }
    >
      <div className="flex flex-col gap-4 pt-2">
        <label className="flex flex-col gap-1.5">
          <span className="px-1 text-sm font-semibold text-muted">
            {t("spaceName")}
          </span>
          <input
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            placeholder={ta("name")}
            className="h-12 w-full rounded-cute bg-surface-muted px-4 outline-none placeholder:text-muted/60"
          />
        </label>
        <Button onClick={save} disabled={pending || !name.trim()} className="w-full">
          {pending ? tc("loading") : tc("save")}
        </Button>
      </div>
    </Sheet>
  );
}
