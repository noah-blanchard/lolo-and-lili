import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getProfile, getSession } from "@/lib/auth";
import { BottomNav } from "@/components/nav/bottom-nav";
import { Onboarding } from "@/components/features/onboarding/onboarding";

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
  const { user } = await getSession();
  if (!user) redirect(`/${locale}/login`);

  // Couple gate — solo users must create or join a couple first.
  const profile = await getProfile();
  if (!profile?.couple_id) return <Onboarding />;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      {/* Bottom padding clears the floating nav (~5.5rem) + safe area */}
      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
