"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { springSnappy, tapScale } from "@/lib/motion";
import { useUnreadCount } from "@/hooks/use-notifications";
import { NotificationPanel } from "./notification-panel";

/** Fixed top-right bell with an unread badge; opens the in-app panel. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unread = useUnreadCount();
  const t = useTranslations("a11y");

  // Track increases so the bell "rings" only when a NEW notification arrives
  // (adjust-during-render pattern, React's supported alternative to an effect).
  const [prevUnread, setPrevUnread] = useState(unread);
  const [ring, setRing] = useState(0);
  if (unread !== prevUnread) {
    setPrevUnread(unread);
    if (unread > prevUnread) setRing((r) => r + 1);
  }

  return (
    <>
      <motion.button
        type="button"
        aria-label={t("notifications")}
        onClick={() => setOpen(true)}
        whileTap={tapScale}
        className="fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-foreground shadow-soft"
        style={{ top: "max(1rem, env(safe-area-inset-top))" }}
      >
        <motion.span
          key={ring}
          animate={ring > 0 ? { rotate: [0, -18, 14, -10, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 20%" }}
        >
          <Bell className="h-5 w-5" />
        </motion.span>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key={unread}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.35, 1] }}
              exit={{ scale: 0 }}
              transition={springSnappy}
              className={cn(
                "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full",
                "bg-primary px-1 text-xs font-bold text-primary-foreground",
              )}
            >
              {unread > 99 ? "99+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <NotificationPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
