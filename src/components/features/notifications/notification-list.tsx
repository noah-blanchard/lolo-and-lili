"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { EmptyState } from "@/components/ui/empty-state";
import { popIn, staggerContainer } from "@/lib/motion";
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
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-1"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((n) => (
            <motion.div key={n.id} variants={popIn} exit="exit" layout>
              <NotificationItem
                notification={n}
                onOpen={onOpen}
                onMarkRead={onMarkRead}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
