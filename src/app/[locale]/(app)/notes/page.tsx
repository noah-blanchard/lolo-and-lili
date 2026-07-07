import { getTranslations, setRequestLocale } from "next-intl/server";
import { NotesBoard } from "@/components/features/notes/notes-board";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("notes");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="px-1 pt-2 font-display text-3xl font-bold">{t("title")}</h1>
      <NotesBoard />
    </div>
  );
}
