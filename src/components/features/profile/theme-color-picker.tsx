"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Palette } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useCouple } from "@/components/providers/couple-provider";
import { useColorTheme } from "@/components/providers/color-theme-provider";
import { updateProfileAction } from "@/app/actions/profiles";
import { isOk } from "@/lib/api/result";
import { COLOR_THEMES, resolveColorTheme } from "@/lib/themes";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeColorPicker() {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const router = useRouter();
  const { me } = useCouple();
  const { theme, setTheme } = useColorTheme();

  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState<ReturnType<typeof resolveColorTheme>>(
    resolveColorTheme(me.theme_pref),
  );

  function onOpenChange(next: boolean) {
    if (next) setSelected(resolveColorTheme(me.theme_pref));
    setOpen(next);
  }

  // Live preview while the drawer is open.
  function preview(key: ReturnType<typeof resolveColorTheme>) {
    setSelected(key);
    setTheme(key);
  }

  async function save() {
    if (pending) return;
    setPending(true);
    const res = await updateProfileAction({ theme_pref: selected });
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
      title={t("theme")}
      description={t("themeHint")}
      trigger={
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-cute bg-surface p-5 text-left shadow-soft"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-muted text-2xl">
            <Palette className="size-6 text-primary" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display font-semibold">
              {t("theme")}
            </span>
            <span className="block text-sm text-muted">
              {COLOR_THEMES.find((x) => x.key === theme)?.label ?? t("theme")}
            </span>
          </span>
          <span className="flex shrink-0 -space-x-1.5">
            {COLOR_THEMES.find((x) => x.key === theme)?.swatch.map((c, i) => (
              <span
                key={i}
                className="size-4 rounded-full ring-2 ring-surface"
                style={{ backgroundColor: c }}
              />
            ))}
          </span>
        </button>
      }
    >
      <div className="flex flex-col gap-5 pt-2">
        <div className="grid grid-cols-2 gap-3">
          {COLOR_THEMES.map((opt) => {
            const active = selected === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => preview(opt.key)}
                className={cn(
                  "flex items-center gap-3 rounded-cute p-3 text-left transition",
                  active ? "ring-2 ring-primary" : "ring-1 ring-border",
                )}
                style={{ backgroundColor: opt.swatch[0] }}
              >
                <span className="flex shrink-0 -space-x-1.5">
                  {opt.swatch.slice(1).map((c, i) => (
                    <span
                      key={i}
                      className="size-6 rounded-full ring-2 ring-surface"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </span>
                <span className="flex items-center gap-1.5 font-display font-semibold">
                  <span>{opt.emoji}</span>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        <Button onClick={save} disabled={pending} className="w-full">
          {pending ? tc("loading") : tc("save")}
        </Button>
      </div>
    </Sheet>
  );
}
