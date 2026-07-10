import { getTranslations, setRequestLocale } from "next-intl/server";
import { ListChecks, ShoppingBasket, UtensilsCrossed, Wallet } from "lucide-react";
import { HubCard } from "@/components/ui/hub-card";
import { StaggerIn } from "@/components/ui/stagger-in";

export default async function MaisonPage({
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
        <h1 className="font-display text-3xl font-bold">{t("hub.maisonTitle")}</h1>
        <p className="text-muted">{t("hub.maisonSubtitle")}</p>
      </header>

      <StaggerIn className="grid grid-cols-2 gap-3">
        <HubCard
          href="/chores"
          label={t("nav.chores")}
          description={t("hub.choresDesc")}
          icon={ListChecks}
        />
        <HubCard
          href="/grocery"
          label={t("grocery.title")}
          description={t("hub.groceryDesc")}
          icon={ShoppingBasket}
        />
        <HubCard
          href="/meals"
          label={t("meals.title")}
          description={t("hub.mealsDesc")}
          icon={UtensilsCrossed}
        />
        <HubCard
          href="/expenses"
          label={t("expenses.title")}
          description={t("hub.expensesDesc")}
          icon={Wallet}
        />
      </StaggerIn>
    </div>
  );
}
