import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getSession } from "@/lib/auth";
import { makeServerQueryClient } from "@/lib/query/server";
import { queryKeys } from "@/lib/query/keys";
import { getExpensesView } from "@/lib/services/expenses";
import { ExpensesBoard } from "@/components/features/expenses/expenses-board";

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("expenses");

  const { supabase, user } = await getSession();
  const qc = makeServerQueryClient();
  if (user) {
    await qc.prefetchQuery({
      queryKey: queryKeys.expenses(),
      queryFn: () => getExpensesView(supabase, user),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div className="flex flex-col gap-5">
        <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
        <ExpensesBoard />
      </div>
    </HydrationBoundary>
  );
}
