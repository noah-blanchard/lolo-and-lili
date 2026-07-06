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
