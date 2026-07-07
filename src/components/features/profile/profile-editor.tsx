"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useCouple } from "@/components/providers/couple-provider";
import { updateProfileAction } from "@/app/actions/profiles";
import { isOk } from "@/lib/api/result";
import {
  AVATAR_EMOJIS,
  ACCENTS,
  accentHex,
  type AccentKey,
  type AvatarEmoji,
} from "@/lib/avatars";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function toEmoji(value: string | null): AvatarEmoji {
  return (AVATAR_EMOJIS as readonly string[]).includes(value ?? "")
    ? (value as AvatarEmoji)
    : AVATAR_EMOJIS[0];
}

function toAccent(value: string | null): AccentKey {
  return ACCENTS.some((a) => a.key === value) ? (value as AccentKey) : "coral";
}

export function ProfileEditor() {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const router = useRouter();
  const { me } = useCouple();

  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState(me.display_name ?? "");
  const [emoji, setEmoji] = useState<AvatarEmoji>(toEmoji(me.avatar_emoji));
  const [accent, setAccent] = useState<AccentKey>(toAccent(me.accent_color));

  function onOpenChange(next: boolean) {
    // Re-sync from the latest profile each time the sheet opens.
    if (next) {
      setName(me.display_name ?? "");
      setEmoji(toEmoji(me.avatar_emoji));
      setAccent(toAccent(me.accent_color));
    }
    setOpen(next);
  }

  async function save() {
    if (pending) return;
    setPending(true);
    const res = await updateProfileAction({
      display_name: name.trim() || null,
      avatar_emoji: emoji,
      accent_color: accent,
    });
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
      title={t("editProfile")}
      trigger={
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-cute bg-surface p-5 text-left shadow-soft"
        >
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-muted text-2xl"
            style={{ boxShadow: `0 0 0 2px ${accentHex(me.accent_color)}` }}
          >
            {me.avatar_emoji ?? "🐣"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display font-semibold">
              {me.display_name ?? t("name")}
            </span>
            <span className="block text-sm text-muted">{t("editProfile")}</span>
          </span>
          <Pencil className="size-5 shrink-0 text-muted" />
        </button>
      }
    >
      <div className="flex flex-col gap-5 pt-2">
        <label className="flex flex-col gap-1.5">
          <span className="px-1 text-sm font-semibold text-muted">
            {t("name")}
          </span>
          <input
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="h-12 w-full rounded-cute bg-surface-muted px-4 outline-none placeholder:text-muted/60"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="px-1 text-sm font-semibold text-muted">
            {t("avatar")}
          </span>
          <div className="grid grid-cols-8 gap-1.5">
            {AVATAR_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-cute bg-surface-muted text-xl transition",
                  emoji === e && "ring-2 ring-primary",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="px-1 text-sm font-semibold text-muted">
            {t("color")}
          </span>
          <div className="flex flex-wrap gap-2.5">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                type="button"
                aria-label={a.key}
                onClick={() => setAccent(a.key)}
                style={{ backgroundColor: a.hex }}
                className={cn(
                  "size-9 rounded-full transition",
                  accent === a.key &&
                    "ring-2 ring-foreground/70 ring-offset-2 ring-offset-background",
                )}
              />
            ))}
          </div>
        </div>

        <Button onClick={save} disabled={pending} className="w-full">
          {pending ? tc("loading") : tc("save")}
        </Button>
      </div>
    </Sheet>
  );
}
