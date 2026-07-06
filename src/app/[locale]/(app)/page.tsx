import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <header className="px-1 pt-2">
        <h1 className="font-display text-3xl font-bold">
          {t("home.greeting", { name: "Lolo" })}
        </h1>
        <p className="text-muted">{t("app.tagline")}</p>
      </header>

      <Card>
        <CardTitle>{t("home.statusTitle")}</CardTitle>
        <CardDescription>{t("status.free")} · {t("status.busy")}</CardDescription>
      </Card>

      <Card>
        <CardTitle>{t("home.todayTitle")}</CardTitle>
        <CardDescription>{t("home.empty")}</CardDescription>
      </Card>
    </div>
  );
}
