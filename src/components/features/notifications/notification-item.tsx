"use client";

import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { timeAgo } from "@/lib/dates";
import { tapScale } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationGlyph } from "./notification-glyph";
import type { AppNotification } from "@/lib/schemas/notification";

export function NotificationItem({
  notification,
  onOpen,
  onMarkRead,
}: {
  notification: AppNotification;
  onOpen: (n: AppNotification) => void;
  onMarkRead: (id: string) => void;
}) {
  const t = useTranslations("notifications.inApp");
  const locale = useLocale();

  return (
    <motion.div
      whileTap={tapScale}
      onClick={() => {
        onMarkRead(notification.id);
        onOpen(notification);
      }}
      className={cn(
        "flex items-start gap-3 rounded-cute p-3",
        notification.read ? "bg-transparent" : "bg-surface-muted",
      )}
    >
      <NotificationGlyph category={notification.category} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-display font-semibold">{notification.title}</p>
          {!notification.read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="truncate text-sm text-muted">{notification.body}</p>
        <p className="mt-1 text-xs text-muted">
          {timeAgo(notification.created_at, locale)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onMarkRead(notification.id);
          onOpen(notification);
        }}
      >
        {t("goTo")}
      </Button>
    </motion.div>
  );
}
