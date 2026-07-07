import { getTranslations, setRequestLocale } from "next-intl/server";
import { CouponsBoard } from "@/components/features/coupons/coupons-board";

export default async function CouponsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("coupons");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
      <CouponsBoard />
    </div>
  );
}
