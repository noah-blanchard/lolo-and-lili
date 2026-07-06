import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProfile, getSession } from "@/lib/auth";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/nav/theme-toggle";
import { LocaleSwitcher } from "@/components/nav/locale-switcher";
import { signOut } from "@/app/actions/auth";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const { supabase } = await getSession();
  const profile = await getProfile();

  let inviteCode: string | null = null;
  if (profile?.couple_id) {
    const { data } = await supabase
      .from("couples")
      .select("*")
      .eq("id", profile.couple_id)
      .single();
    inviteCode = data?.invite_code ?? null;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="px-1 pt-2 font-display text-3xl font-bold">
        {t("nav.profile")}
      </h1>

      {inviteCode && (
        <Card className="flex flex-col gap-1">
          <CardTitle>{t("profile.inviteCode")}</CardTitle>
          <p className="font-display text-3xl font-bold tracking-widest text-primary">
            {inviteCode}
          </p>
          <CardDescription>{t("profile.inviteHint")}</CardDescription>
        </Card>
      )}

      <Card className="flex items-center justify-between">
        <CardDescription>{t("profile.theme")}</CardDescription>
        <ThemeToggle />
      </Card>

      <Card className="flex items-center justify-between">
        <CardDescription>{t("profile.language")}</CardDescription>
        <LocaleSwitcher />
      </Card>

      <form action={signOut}>
        <Button type="submit" variant="ghost" className="w-full text-busy">
          {t("profile.signOut")}
        </Button>
      </form>
    </div>
  );
}
