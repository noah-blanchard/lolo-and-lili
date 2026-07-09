import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getProfile, getSession } from "@/lib/auth";
import { getCoupleMembers } from "@/lib/services/couples";
import { BottomNav } from "@/components/nav/bottom-nav";
import { Onboarding } from "@/components/features/onboarding/onboarding";
import { CoupleProvider } from "@/components/providers/couple-provider";
import { ColorThemeProvider } from "@/components/providers/color-theme-provider";
import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { NotificationBell } from "@/components/features/notifications/notification-bell";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Auth gate — unauthenticated users go to login.
  const { supabase, user } = await getSession();
  if (!user) redirect(`/${locale}/login`);

  // Couple gate — solo users must create or join a couple first.
  const profile = await getProfile();
  if (!profile?.couple_id) return <Onboarding />;

  const members = await getCoupleMembers(supabase, profile.couple_id);
  const me = members.find((m) => m.id === user.id) ?? profile;
  const partner = members.find((m) => m.id !== user.id) ?? null;

  return (
    <CoupleProvider value={{ coupleId: profile.couple_id, me, partner }}>
      <ColorThemeProvider initialTheme={me.theme_pref}>
        <RealtimeProvider coupleId={profile.couple_id} userId={user.id}>
          <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
            {/* Bottom padding clears the floating nav (~5.5rem) + safe area */}
            <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
            <NotificationBell />
            <BottomNav />
          </div>
        </RealtimeProvider>
      </ColorThemeProvider>
    </CoupleProvider>
  );
}
