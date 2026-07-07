import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProfile, getSession } from "@/lib/auth";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusCard } from "@/components/features/status/status-card";
import { PetWidget } from "@/components/features/pet/pet-widget";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { supabase } = await getSession();
  const profile = await getProfile();
  const name = profile?.display_name ?? t("status.me");

  let spaceName: string | null = null;
  if (profile?.couple_id) {
    const { data } = await supabase
      .from("couples")
      .select("name")
      .eq("id", profile.couple_id)
      .single();
    spaceName = data?.name ?? null;
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="px-1 pt-2">
        <h1 className="font-display text-3xl font-bold">
          {t("home.greeting", { name })}
        </h1>
        <p className="text-muted">{spaceName ?? t("app.tagline")}</p>
      </header>

      <StatusCard />

      <PetWidget />

      <Card>
        <CardTitle>{t("home.todayTitle")}</CardTitle>
        <CardDescription>{t("home.empty")}</CardDescription>
      </Card>
    </div>
  );
}
