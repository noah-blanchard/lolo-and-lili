import { getTranslations, setRequestLocale } from "next-intl/server";
import { Smile, NotebookPen, Ticket } from "lucide-react";
import { HubCard } from "@/components/ui/hub-card";

export default async function NousPage({
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
        <h1 className="font-display text-3xl font-bold">{t("hub.nousTitle")}</h1>
        <p className="text-muted">{t("hub.nousSubtitle")}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <HubCard
          href="/moods"
          label={t("nav.moods")}
          description={t("hub.moodsDesc")}
          icon={Smile}
        />
        <HubCard
          href="/notes"
          label={t("notes.title")}
          description={t("hub.notesDesc")}
          icon={NotebookPen}
        />
        <HubCard
          href="/coupons"
          label={t("coupons.title")}
          description={t("hub.couponsDesc")}
          icon={Ticket}
        />
      </div>
    </div>
  );
}
