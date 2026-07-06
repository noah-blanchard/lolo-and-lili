import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusCard } from "@/components/features/status/status-card";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const profile = await getProfile();
  const name = profile?.display_name ?? "🌸";

  return (
    <div className="flex flex-col gap-5">
      <header className="px-1 pt-2">
        <h1 className="font-display text-3xl font-bold">
          {t("home.greeting", { name })}
        </h1>
        <p className="text-muted">{t("app.tagline")}</p>
      </header>

      <StatusCard />

      <Card>
        <CardTitle>{t("home.todayTitle")}</CardTitle>
        <CardDescription>{t("home.empty")}</CardDescription>
      </Card>
    </div>
  );
}
