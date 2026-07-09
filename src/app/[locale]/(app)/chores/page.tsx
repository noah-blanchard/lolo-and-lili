import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getSession } from "@/lib/auth";
import { makeServerQueryClient } from "@/lib/query/server";
import { queryKeys } from "@/lib/query/keys";
import { listChores } from "@/lib/services/chores";
import { ChoreList } from "@/components/features/chores/chore-list";

export default async function ChoresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("chores");

  const { supabase } = await getSession();
  const qc = makeServerQueryClient();
  await qc.prefetchQuery({
    queryKey: queryKeys.chores(),
    queryFn: () => listChores(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div className="flex flex-col gap-5">
        <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
        <ChoreList />
      </div>
    </HydrationBoundary>
  );
}
