import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getProfile, getSession } from "@/lib/auth";
import { makeServerQueryClient } from "@/lib/query/server";
import { queryKeys } from "@/lib/query/keys";
import { getStatuses } from "@/lib/services/statuses";
import { listMoods } from "@/lib/services/moods";
import { getNudgeState } from "@/lib/services/nudges";
import { getPet } from "@/lib/services/pets";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusCard } from "@/components/features/status/status-card";
import { PetWidget } from "@/components/features/pet/pet-widget";
import { TreatsCard } from "@/components/features/pet/treats-card";
import { NudgeButtons } from "@/components/features/nudge/nudge-buttons";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { supabase, user } = await getSession();
  const profile = await getProfile();
  const name = profile?.display_name ?? t("status.me");
  const coupleId = profile?.couple_id;

  // Prefetch the queries the home widgets read so they hydrate on first paint
  // instead of each firing a client round-trip after hydration (F-021).
  const qc = makeServerQueryClient();
  const jobs = [
    qc.prefetchQuery({ queryKey: queryKeys.status(), queryFn: () => getStatuses(supabase) }),
    qc.prefetchQuery({ queryKey: queryKeys.moods(), queryFn: () => listMoods(supabase) }),
  ];
  if (user) {
    jobs.push(
      qc.prefetchQuery({ queryKey: queryKeys.nudges(), queryFn: () => getNudgeState(supabase, user) }),
    );
  }
  if (user && coupleId) {
    jobs.push(
      qc.prefetchQuery({ queryKey: queryKeys.pet(), queryFn: () => getPet(supabase, coupleId, user.id) }),
    );
  }

  let spaceName: string | null = null;
  if (coupleId) {
    const { data } = await supabase
      .from("couples")
      .select("name")
      .eq("id", coupleId)
      .single();
    spaceName = data?.name ?? null;
  }

  await Promise.all(jobs);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div className="flex flex-col gap-5">
        <header className="px-1 pt-2">
          <h1 className="font-display text-3xl font-bold">
            {t("home.greeting", { name })}
          </h1>
          <p className="text-muted">{spaceName ?? t("app.tagline")}</p>
        </header>

        <StatusCard />

        <NudgeButtons />

        <PetWidget />

        <TreatsCard />

        <Card>
          <CardTitle>{t("home.todayTitle")}</CardTitle>
          <CardDescription>{t("home.empty")}</CardDescription>
        </Card>
      </div>
    </HydrationBoundary>
  );
}
