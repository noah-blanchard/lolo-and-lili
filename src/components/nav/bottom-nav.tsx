"use client";

import { Home, ListChecks, Smile, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { springBouncy } from "@/lib/motion";

const items = [
  { href: "/", key: "home", icon: Home },
  { href: "/chores", key: "chores", icon: ListChecks },
  { href: "/moods", key: "moods", icon: Smile },
  { href: "/profile", key: "profile", icon: Heart },
] as const;

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-safe">
      <div className="pointer-events-auto m-3 flex w-full max-w-md items-stretch justify-around gap-1 rounded-cute border border-border bg-surface/90 p-1.5 shadow-cute backdrop-blur-lg">
        {items.map(({ href, key, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={key}
              href={href}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-[1.25rem] px-2 py-2"
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  transition={springBouncy}
                  className="absolute inset-0 rounded-[1.25rem] bg-primary/15"
                />
              )}
              <Icon
                className={cn(
                  "relative z-10 size-6 transition-colors",
                  active ? "text-primary" : "text-muted",
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={cn(
                  "relative z-10 text-[0.65rem] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted",
                )}
              >
                {t(key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
