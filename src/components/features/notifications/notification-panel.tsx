"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
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
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-cute bg-surface-muted px-4 py-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
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
