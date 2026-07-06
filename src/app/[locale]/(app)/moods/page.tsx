import { getTranslations, setRequestLocale } from "next-intl/server";
import { MoodPicker } from "@/components/features/moods/mood-picker";
import { MoodTimeline } from "@/components/features/moods/mood-timeline";

export default async function MoodsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("moods");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
      <MoodPicker />
      <MoodTimeline />
    </div>
  );
}
