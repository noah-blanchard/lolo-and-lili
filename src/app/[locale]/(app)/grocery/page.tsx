import { getTranslations, setRequestLocale } from "next-intl/server";
import { GroceryList } from "@/components/features/grocery/grocery-list";

export default async function GroceryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("grocery");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
      <GroceryList />
    </div>
  );
}
