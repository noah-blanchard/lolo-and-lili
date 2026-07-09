"use client";

import { Star, House, Heart, Dog, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { springBouncy } from "@/lib/motion";

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
  { href: "/", key: "home", icon: Star, match: (p: string) => p === "/" },
  { href: "/pet", key: "pet", icon: Dog, match: (p: string) => p === "/pet" || p.startsWith("/pet/") },
  { href: "/profile", key: "profile", icon: UserRound, match: (p: string) => p.startsWith("/profile") },
] as const;

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-safe">
      <div className="pointer-events-auto m-3 flex w-full max-w-md items-stretch justify-around gap-1 rounded-cute border border-border bg-surface/90 p-1.5 shadow-cute backdrop-blur-lg">
        {items.map(({ href, key, icon: Icon, match }, index) => {
          const active = match(pathname);
          const isCenter = index === 2;
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-[1.25rem] px-2",
                isCenter ? "py-3" : "py-2",
              )}
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
                  "relative z-10 transition-colors",
                  isCenter ? "size-8" : "size-6",
                  active ? "text-primary" : "text-muted",
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={cn(
                  "relative z-10 font-semibold transition-colors",
                  isCenter ? "text-[0.7rem]" : "text-[0.65rem]",
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
