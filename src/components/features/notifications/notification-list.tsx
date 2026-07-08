"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";
import { NotificationItem } from "./notification-item";
import type { AppNotification } from "@/lib/schemas/notification";

export function NotificationList({
  items,
  onOpen,
  onMarkRead,
  onMarkAll,
  hasUnread,
}: {
  items: AppNotification[];
  onOpen: (n: AppNotification) => void;
  onMarkRead: (id: string) => void;
  onMarkAll: () => void;
  hasUnread: boolean;
}) {
  const t = useTranslations("notifications.inApp");

  if (!items.length) {
    return <EmptyState emoji="🔔" title={t("empty")} description={t("emptyHint")} />;
  }

  return (
    <div className="flex flex-col gap-2">
      {hasUnread && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onMarkAll}
            className="font-display text-sm font-semibold text-primary"
          >
            {t("markAllRead")}
          </button>
        </div>
      )}
      <div className="flex flex-col gap-1">
        {items.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onOpen={onOpen}
            onMarkRead={onMarkRead}
          />
        ))}
      </div>
    </div>
  );
}
