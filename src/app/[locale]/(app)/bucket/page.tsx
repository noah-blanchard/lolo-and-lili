import { getTranslations, setRequestLocale } from "next-intl/server";
import { BucketList } from "@/components/features/bucket/bucket-list";

export default async function BucketPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bucket");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
      <BucketList />
    </div>
  );
}
