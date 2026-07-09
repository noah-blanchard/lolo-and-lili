import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { zhCN } from "date-fns/locale/zh-CN";

/** Locale-aware "3 minutes ago" style relative time. */
export function timeAgo(date: string | Date, locale: string): string {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: locale === "zh" ? zhCN : fr,
  });
}

/**
 * Locale-aware "last seen" label.
 * < 60 min → minutes (e.g. "il y a 5 minutes" / "5分钟前")
 * ≥ 60 min → whole hours rounded down (e.g. "il y a 1 heure" / "1小时前")
 */
export function lastSeenLabel(date: string | Date, locale: string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 60_000));

  if (diffMin <= 0) {
    return locale === "zh" ? "刚刚" : "à l'instant";
  }

  if (diffMin < 60) {
    return locale === "zh"
      ? `${diffMin}分钟前`
      : `il y a ${diffMin} minute${diffMin > 1 ? "s" : ""}`;
  }

  const hours = Math.floor(diffMin / 60);
  return locale === "zh"
    ? `${hours}小时前`
    : `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
}
