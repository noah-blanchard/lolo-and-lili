import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProfile, getSession } from "@/lib/auth";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/nav/theme-toggle";
import { LocaleSwitcher } from "@/components/nav/locale-switcher";
import { ProfileEditor } from "@/components/features/profile/profile-editor";
import { ThemeColorPicker } from "@/components/features/profile/theme-color-picker";
import { CoupleNameEditor } from "@/components/features/profile/couple-name-editor";
import { NotificationsCard } from "@/components/features/notifications/notifications-card";
import {
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPrefs,
} from "@/lib/schemas/push";
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

  const notificationPrefs: NotificationPrefs = {
    ...DEFAULT_NOTIFICATION_PREFS,
    ...((profile?.notification_prefs as Partial<NotificationPrefs> | null) ?? {}),
  };

  let inviteCode: string | null = null;
  let coupleName: string | null = null;
  if (profile?.couple_id) {
    const { data } = await supabase
      .from("couples")
      .select("*")
      .eq("id", profile.couple_id)
      .single();
    inviteCode = data?.invite_code ?? null;
    coupleName = data?.name ?? null;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="px-1 pt-2 font-display text-3xl font-bold">
        {t("nav.profile")}
      </h1>

      <ProfileEditor />

      <CoupleNameEditor coupleName={coupleName} />

      {inviteCode && (
        <Card className="flex flex-col gap-1">
          <CardTitle>{t("profile.inviteCode")}</CardTitle>
          <p className="font-display text-3xl font-bold tracking-widest text-primary">
            {inviteCode}
          </p>
          <CardDescription>{t("profile.inviteHint")}</CardDescription>
        </Card>
      )}

      <ThemeColorPicker />

      <Card className="flex items-center justify-between">
        <CardDescription>{t("profile.appearance")}</CardDescription>
        <ThemeToggle />
      </Card>

      <Card className="flex items-center justify-between">
        <CardDescription>{t("profile.language")}</CardDescription>
        <LocaleSwitcher />
      </Card>

      <NotificationsCard initialPrefs={notificationPrefs} />

      <form action={signOut}>
        <Button type="submit" variant="ghost" className="w-full text-busy">
          {t("profile.signOut")}
        </Button>
      </form>
    </div>
  );
}
