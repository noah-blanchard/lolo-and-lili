import { getTranslations, setRequestLocale } from "next-intl/server";
import { CountdownList } from "@/components/features/dates/countdown-list";

export default async function DatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dates");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
      <CountdownList />
    </div>
  );
}
