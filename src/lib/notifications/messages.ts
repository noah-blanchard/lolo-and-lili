import type { NotifyCategory } from "@/lib/schemas/push";

/** Which templated push each domain event maps to. */
export type NotifyKey =
  | "chore_done"
  | "mood"
  | "status_busy"
  | "status_free"
  | "pet_cuddle"
  | "pet_callback"
  | "love_note"
  | "love_nudge"
  | "coupon_gifted"
  | "coupon_redeemed"
  | "question_answered"
  | "date_today"
  | "date_soon"
  | "meal_assigned"
  | "expense_added"
  | "expense_settled";

type Loc = "fr" | "zh";
type Vars = { actor: string; extra?: string };
type Built = { title: string; body: string; url: string };

/**
 * Localized push copy, keyed by template then locale. Kept server-side (no
 * next-intl on the send path) and localized per the recipient device's locale.
 * Keep roughly in sync with the `notifications` block in the i18n catalogs.
 */
export const NOTIFY: Record<NotifyKey, Record<Loc, (v: Vars) => Built>> = {
  chore_done: {
    fr: (v) => ({
      title: "Corvée terminée 🎉",
      body: `${v.actor} a coché « ${v.extra} »`,
      url: "/chores",
    }),
    zh: (v) => ({
      title: "家务完成啦 🎉",
      body: `${v.actor} 完成了「${v.extra}」`,
      url: "/chores",
    }),
  },
  mood: {
    fr: (v) => ({
      title: "Nouvelle humeur 💭",
      body: `${v.actor} partage son humeur ${v.extra ?? ""}`.trim(),
      url: "/moods",
    }),
    zh: (v) => ({
      title: "新的心情 💭",
      body: `${v.actor} 分享了心情 ${v.extra ?? ""}`.trim(),
      url: "/moods",
    }),
  },
  status_busy: {
    fr: (v) => ({ title: "Occupé·e 🔴", body: `${v.actor} est occupé·e`, url: "/" }),
    zh: (v) => ({ title: "忙碌中 🔴", body: `${v.actor} 现在很忙`, url: "/" }),
  },
  status_free: {
    fr: (v) => ({ title: "Disponible 🟢", body: `${v.actor} est libre`, url: "/" }),
    zh: (v) => ({ title: "有空啦 🟢", body: `${v.actor} 现在有空`, url: "/" }),
  },
  pet_cuddle: {
    fr: (v) => ({
      title: "Câlin en attente 🐶",
      body: `${v.actor} a fait un câlin — à ton tour pour le streak !`,
      url: "/pet",
    }),
    zh: (v) => ({
      title: "等你抱抱 🐶",
      body: `${v.actor} 抱了狗狗——快回抱保持连击！`,
      url: "/pet",
    }),
  },
  pet_callback: {
    fr: (v) => ({
      title: "Il s'est enfui ! 🐾",
      body: `Rappelez votre chien à deux avec ${v.actor}`,
      url: "/pet",
    }),
    zh: (v) => ({
      title: "狗狗跑走了！🐾",
      body: `和 ${v.actor} 一起把它叫回来`,
      url: "/pet",
    }),
  },
  love_note: {
    fr: (v) => ({
      title: "Un petit mot 💌",
      body: `${v.actor} t'a laissé un mot doux`,
      url: "/notes",
    }),
    zh: (v) => ({
      title: "一张小纸条 💌",
      body: `${v.actor} 给你留了句情话`,
      url: "/notes",
    }),
  },
  love_nudge: {
    fr: (v) => ({
      title: "On pense à toi 💕",
      body: `${v.actor} t'envoie plein de cœurs`,
      url: "/notes",
    }),
    zh: (v) => ({
      title: "有人在想你 💕",
      body: `${v.actor} 给你送来满满的爱心`,
      url: "/notes",
    }),
  },
  coupon_gifted: {
    fr: (v) => ({
      title: "Un bon pour toi 🎟️",
      body: `${v.actor} t'offre « ${v.extra} »`,
      url: "/coupons",
    }),
    zh: (v) => ({
      title: "送你一张券 🎟️",
      body: `${v.actor} 送你「${v.extra}」`,
      url: "/coupons",
    }),
  },
  coupon_redeemed: {
    fr: (v) => ({
      title: "Bon utilisé 🎉",
      body: `${v.actor} a utilisé « ${v.extra} »`,
      url: "/coupons",
    }),
    zh: (v) => ({
      title: "券被兑换啦 🎉",
      body: `${v.actor} 用了「${v.extra}」`,
      url: "/coupons",
    }),
  },
  question_answered: {
    fr: (v) => ({
      title: "Question du jour ❓",
      body: `${v.actor} a répondu — à ton tour !`,
      url: "/question",
    }),
    zh: (v) => ({
      title: "今日问题 ❓",
      body: `${v.actor} 回答啦——轮到你咯！`,
      url: "/question",
    }),
  },
  date_today: {
    fr: (v) => ({ title: "C'est le jour J ! 🎉", body: v.extra ?? "", url: "/dates" }),
    zh: (v) => ({ title: "就是今天啦！🎉", body: v.extra ?? "", url: "/dates" }),
  },
  date_soon: {
    fr: (v) => ({ title: "Dans une semaine 🗓️", body: v.extra ?? "", url: "/dates" }),
    zh: (v) => ({ title: "还有一周 🗓️", body: v.extra ?? "", url: "/dates" }),
  },
  meal_assigned: {
    fr: (v) => ({
      title: "Aux fourneaux 👩‍🍳",
      body: `${v.actor} t'a désigné·e chef : ${v.extra}`,
      url: "/meals",
    }),
    zh: (v) => ({
      title: "该你下厨啦 👩‍🍳",
      body: `${v.actor} 指定你做：${v.extra}`,
      url: "/meals",
    }),
  },
  expense_added: {
    fr: (v) => ({
      title: "Nouvelle dépense 💸",
      body: `${v.actor} a ajouté : ${v.extra}`,
      url: "/expenses",
    }),
    zh: (v) => ({
      title: "新的开销 💸",
      body: `${v.actor} 记了一笔：${v.extra}`,
      url: "/expenses",
    }),
  },
  expense_settled: {
    fr: (v) => ({
      title: "Comptes réglés ✅",
      body: `${v.actor} a soldé les comptes`,
      url: "/expenses",
    }),
    zh: (v) => ({
      title: "账已结清 ✅",
      body: `${v.actor} 结清了账目`,
      url: "/expenses",
    }),
  },
};

/** Which mutable category each template belongs to (for opt-out checks). */
export const CATEGORY_OF: Record<NotifyKey, NotifyCategory> = {
  chore_done: "chores",
  mood: "moods",
  status_busy: "status",
  status_free: "status",
  pet_cuddle: "pet",
  pet_callback: "pet",
  love_note: "love",
  love_nudge: "love",
  coupon_gifted: "love",
  coupon_redeemed: "love",
  question_answered: "love",
  date_today: "dates",
  date_soon: "dates",
  meal_assigned: "home",
  expense_added: "home",
  expense_settled: "home",
};

/** Build the payload for a template in the given locale (falls back to fr). */
export function buildPayload(message: NotifyKey, locale: string, vars: Vars): Built {
  const loc: Loc = locale === "zh" ? "zh" : "fr";
  return NOTIFY[message][loc](vars);
}
