/**
 * The daily question bank. Both partners see the SAME prompt each day
 * (deterministic pick by UTC day-index), answer privately, then it reveals
 * once both have answered. fr + zh copy live here (server picks; client renders).
 */
export const QUESTIONS = [
  { key: "fav_memory", fr: "Quel est ton souvenir préféré de nous ?", zh: "你最喜欢我们的哪个回忆？" },
  { key: "first_impression", fr: "Ta première impression de moi ?", zh: "你对我的第一印象是什么？" },
  { key: "dream_trip", fr: "Le prochain voyage de tes rêves, à deux ?", zh: "你最想和我一起去的下一趟旅行？" },
  { key: "little_thing", fr: "Une petite chose que je fais et que tu adores ?", zh: "我做的哪件小事让你特别喜欢？" },
  { key: "perfect_day", fr: "Ta journée parfaite ensemble, ça ressemble à quoi ?", zh: "和我在一起，完美的一天是怎样的？" },
  { key: "proud_of_you", fr: "De quoi es-tu le plus fier·ère en ce moment ?", zh: "现在你最为自己骄傲的是什么？" },
  { key: "comfort_food", fr: "Le plat qui te réconforte à tous les coups ?", zh: "最能治愈你的一道菜是什么？" },
  { key: "song_of_us", fr: "Une chanson qui te fait penser à nous ?", zh: "哪首歌会让你想起我们？" },
  { key: "superpower", fr: "Si tu avais un super-pouvoir demain, lequel ?", zh: "如果明天拥有一种超能力，你选哪个？" },
  { key: "grateful", fr: "Pour quoi es-tu reconnaissant·e aujourd'hui ?", zh: "今天你对什么心怀感激？" },
  { key: "cozy_night", fr: "Ta soirée cocooning idéale ?", zh: "你理想中窝在家的夜晚是什么样？" },
  { key: "make_you_laugh", fr: "Qu'est-ce qui t'a fait rire récemment ?", zh: "最近有什么让你笑出来的事？" },
  { key: "future_home", fr: "Un détail de notre futur chez-nous ?", zh: "未来我们的家，你想要哪个小细节？" },
  { key: "learn_together", fr: "Une chose qu'on pourrait apprendre ensemble ?", zh: "有什么是我们可以一起学的？" },
  { key: "recharge", fr: "Qu'est-ce qui te ressource quand tu es fatigué·e ?", zh: "累的时候什么能让你恢复元气？" },
  { key: "tiny_win", fr: "Ta petite victoire de la journée ?", zh: "今天你的小小胜利是什么？" },
  { key: "adventure", fr: "La prochaine petite aventure qu'on devrait tenter ?", zh: "我们接下来该试试哪个小冒险？" },
  { key: "love_language", fr: "Comment aimes-tu qu'on te montre de l'amour ?", zh: "你喜欢别人怎样对你表达爱？" },
] as const;

export type Question = (typeof QUESTIONS)[number];
export type QuestionKey = Question["key"];

/** Deterministic prompt for a YYYY-MM-DD date, shared by both partners. */
export function questionForDate(date: string): Question {
  const dayIndex = Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 86_400_000);
  const i = ((dayIndex % QUESTIONS.length) + QUESTIONS.length) % QUESTIONS.length;
  return QUESTIONS[i];
}

export function questionByKey(key: string): Question | undefined {
  return QUESTIONS.find((q) => q.key === key);
}

export function questionText(q: Question, locale: string): string {
  return locale === "zh" ? q.zh : q.fr;
}

/** Today's question state for the couple (partner's answer hidden until reveal). */
export interface QuestionView {
  date: string;
  questionKey: string;
  myAnswer: string | null;
  partnerAnswer: string | null;
  revealed: boolean;
}
