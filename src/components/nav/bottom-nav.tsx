"use client";

import { HeartHandshake, HouseHeart as House, MessageCircleHeart as Heart, Dog, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { springBouncy, tapScale } from "@/lib/motion";

const MotionLink = motion.create(Link);

/** Routes that light up each hub tab (the hub page + its child features). */
const MAISON_ROUTES = ["/maison", "/chores", "/grocery", "/meals", "/expenses"];
const NOUS_ROUTES = [
  "/nous",
  "/notes",
  "/coupons",
  "/question",
  "/dates",
  "/bucket",
];

const inGroup = (pathname: string, routes: string[]) =>
  routes.some((r) => pathname === r || pathname.startsWith(`${r}/`));

const items = [
  { href: "/maison", key: "maison", icon: House, match: (p: string) => inGroup(p, MAISON_ROUTES) },
  { href: "/nous", key: "nous", icon: Heart, match: (p: string) => inGroup(p, NOUS_ROUTES) },
  { href: "/", key: "home", icon: HeartHandshake, match: (p: string) => p === "/" },
  { href: "/pet", key: "pet", icon: Dog, match: (p: string) => p === "/pet" || p.startsWith("/pet/") },
  { href: "/profile", key: "profile", icon: UserRound, match: (p: string) => p.startsWith("/profile") },
] as const;

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-safe">
      <div className="pointer-events-auto m-3 flex w-full max-w-md items-stretch justify-around gap-1 rounded-cute border border-border bg-surface/90 p-1.5 shadow-cute backdrop-blur-lg">
        {items.map(({ href, key, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <MotionLink
              key={key}
              href={href}
              whileTap={tapScale}
              transition={springBouncy}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-[1.25rem] px-2",
                "py-2",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  transition={springBouncy}
                  className="absolute inset-0 rounded-2xl bg-primary/15"
                />
              )}
              <motion.span
                className="relative z-10"
                animate={{ scale: active ? 1.12 : 1, y: active ? -1 : 0 }}
                transition={springBouncy}
              >
                <Icon
                  className={cn(
                    "transition-colors",
                    "size-6",
                    active ? "text-primary" : "text-muted",
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
              </motion.span>
              <span
                className={cn(
                  "relative z-10 font-semibold transition-colors",
                  "text-[0.65rem]",
                  active ? "text-primary" : "text-muted",
                )}
              >
                {t(key)}
              </span>
            </MotionLink>
          );
        })}
      </div>
    </nav>
  );
}
