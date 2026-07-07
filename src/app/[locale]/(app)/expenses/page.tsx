import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExpensesBoard } from "@/components/features/expenses/expenses-board";

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("expenses");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
      <ExpensesBoard />
    </div>
  );
}
