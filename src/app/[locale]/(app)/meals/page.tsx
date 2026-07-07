import { getTranslations, setRequestLocale } from "next-intl/server";
import { WeekPlanner } from "@/components/features/meals/week-planner";

export default async function MealsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("meals");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
      <WeekPlanner />
    </div>
  );
}
