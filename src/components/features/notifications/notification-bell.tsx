"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/use-notifications";
import { NotificationPanel } from "./notification-panel";

/** Fixed top-right bell with an unread badge; opens the in-app panel. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unread = useUnreadCount();
  const t = useTranslations("a11y");

  return (
    <>
      <button
        type="button"
        aria-label={t("notifications")}
        onClick={() => setOpen(true)}
        className="fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-foreground shadow-soft"
        style={{ top: "max(1rem, env(safe-area-inset-top))" }}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span
            className={cn(
              "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full",
              "bg-primary px-1 text-xs font-bold text-primary-foreground",
            )}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      <NotificationPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
