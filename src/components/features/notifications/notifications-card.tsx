"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePush } from "@/hooks/use-push";
import {
  DEFAULT_NOTIFICATION_PREFS,
  NOTIFY_CATEGORIES,
  type NotificationPrefs,
  type NotifyCategory,
} from "@/lib/schemas/push";
import { updateNotificationPrefsAction } from "@/app/actions/profiles";
import { isOk } from "@/lib/api/result";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
        "disabled:opacity-40",
        checked ? "bg-primary" : "bg-surface-muted",
      )}
    >
      <span
        className={cn(
          "absolute left-1 top-1 size-5 rounded-full bg-white shadow-soft transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function NotificationsCard({
  initialPrefs,
}: {
  initialPrefs: NotificationPrefs;
}) {
  const t = useTranslations("notifications");
  const tc = useTranslations("common");
  const {
    supported,
    permission,
    subscribed,
    iosNeedsInstall,
    busy,
    subscribe,
    unsubscribe,
    sendTest,
  } = usePush();

  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs);

  async function onMasterChange(next: boolean) {
    try {
      if (next) {
        const ok = await subscribe();
        if (!ok) {
          toast.error(
            Notification.permission === "denied" ? t("blocked") : t("enableFailed"),
          );
          return;
        }
        toast.success(t("enabled"));
      } else {
        await unsubscribe();
        toast.success(t("disabled"));
      }
    } catch {
      toast.error(tc("error"));
    }
  }

  async function onCategoryChange(category: NotifyCategory, next: boolean) {
    const previous = prefs;
    const optimistic = { ...prefs, [category]: next };
    setPrefs(optimistic);
    const res = await updateNotificationPrefsAction(optimistic);
    if (!isOk(res)) {
      setPrefs(previous);
      toast.error(res.error.message || tc("error"));
    }
  }

  async function onTest() {
    try {
      await sendTest();
      toast.success(t("testSent"));
    } catch {
      toast.error(tc("error"));
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </div>

      {!supported ? (
        <CardDescription>{t("unsupported")}</CardDescription>
      ) : iosNeedsInstall ? (
        <CardDescription>{t("iosInstall")}</CardDescription>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="font-semibold">{t("master")}</span>
            <Toggle
              checked={subscribed}
              disabled={busy || permission === "denied"}
              onChange={onMasterChange}
              label={t("master")}
            />
          </div>

          {permission === "denied" && (
            <CardDescription className="text-busy">{t("blocked")}</CardDescription>
          )}

          <div
            className={cn(
              "flex flex-col gap-3 border-t border-border pt-4 transition-opacity",
              !subscribed && "pointer-events-none opacity-50",
            )}
          >
            {NOTIFY_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm">{t(`categories.${category}`)}</span>
                <Toggle
                  checked={prefs[category] ?? DEFAULT_NOTIFICATION_PREFS[category]}
                  disabled={!subscribed}
                  onChange={(next) => onCategoryChange(category, next)}
                  label={t(`categories.${category}`)}
                />
              </div>
            ))}
          </div>

          {subscribed && (
            <button
              type="button"
              onClick={onTest}
              className="self-start text-sm font-semibold text-primary hover:underline"
            >
              {t("sendTest")}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
