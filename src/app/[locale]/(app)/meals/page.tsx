import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getSession } from "@/lib/auth";
import { makeServerQueryClient } from "@/lib/query/server";
import { queryKeys } from "@/lib/query/keys";
import { getWeek } from "@/lib/services/meals";
import { WeekPlanner } from "@/components/features/meals/week-planner";

export default async function MealsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("meals");

  const { supabase } = await getSession();
  const qc = makeServerQueryClient();
  await qc.prefetchQuery({
    queryKey: queryKeys.meals(),
    queryFn: () => getWeek(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div className="flex flex-col gap-5">
        <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
        <WeekPlanner />
      </div>
    </HydrationBoundary>
  );
}
