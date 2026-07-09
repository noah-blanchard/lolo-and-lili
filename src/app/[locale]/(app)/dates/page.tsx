import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getSession } from "@/lib/auth";
import { makeServerQueryClient } from "@/lib/query/server";
import { queryKeys } from "@/lib/query/keys";
import { listSpecialDates } from "@/lib/services/special-dates";
import { CountdownList } from "@/components/features/dates/countdown-list";

export default async function DatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dates");

  const { supabase } = await getSession();
  const qc = makeServerQueryClient();
  await qc.prefetchQuery({
    queryKey: queryKeys.specialDates(),
    queryFn: () => listSpecialDates(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div className="flex flex-col gap-5">
        <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
        <CountdownList />
      </div>
    </HydrationBoundary>
  );
}
