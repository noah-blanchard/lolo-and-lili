import type { NotifyCategory } from "@/lib/schemas/push";
import { ListTodo, Smile, CircleDot, Dog, Heart, CalendarHeart, House } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { accentHex } from "@/lib/avatars";

const GLYPH: Record<NotifyCategory, { icon: LucideIcon; accent: string }> = {
  chores: { icon: ListTodo, accent: "mint" },
  moods: { icon: Smile, accent: "lemon" },
  status: { icon: CircleDot, accent: "sky" },
  pet: { icon: Dog, accent: "peach" },
  love: { icon: Heart, accent: "bubblegum" },
  dates: { icon: CalendarHeart, accent: "lavender" },
  home: { icon: House, accent: "sage" },
};

/** Cute, circular category glyph tinted with the couple accent palette. */
export function NotificationGlyph({
  category,
  className,
}: {
  category: NotifyCategory;
  className?: string;
}) {
  const { icon: Icon, accent } = GLYPH[category];
  const hex = accentHex(accent);
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        className,
      )}
      style={{ backgroundColor: `${hex}26`, color: hex }}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}
