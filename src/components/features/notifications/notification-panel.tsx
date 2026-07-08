"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Sheet } from "@/components/ui/sheet";
import { NotificationList } from "./notification-list";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";

export function NotificationPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("notifications.inApp");
  const router = useRouter();
  const { data: items, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const list = items ?? [];
  const hasUnread = list.some((n) => !n.read);

  const handleOpen = (id: string, target: string) => {
    markRead.mutate(id);
    router.push(target);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("panelTitle")}
      description={t("panelSubtitle")}
    >
      {isLoading ? null : (
        <NotificationList
          items={list}
          hasUnread={hasUnread}
          onOpen={(n) => handleOpen(n.id, n.target)}
          onMarkRead={(id) => markRead.mutate(id)}
          onMarkAll={() => markAll.mutate()}
        />
      )}
    </Sheet>
  );
}
