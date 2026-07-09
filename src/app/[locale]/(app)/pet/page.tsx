import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getProfile, getSession } from "@/lib/auth";
import { makeServerQueryClient } from "@/lib/query/server";
import { queryKeys } from "@/lib/query/keys";
import { getPet, listMemories } from "@/lib/services/pets";
import { PetScreen } from "@/components/features/pet/pet-screen";

export default async function PetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { supabase, user } = await getSession();
  const profile = await getProfile();
  const coupleId = profile?.couple_id;
  const qc = makeServerQueryClient();
  if (user && coupleId) {
    await Promise.all([
      qc.prefetchQuery({
        queryKey: queryKeys.pet(),
        queryFn: () => getPet(supabase, coupleId, user.id),
      }),
      qc.prefetchQuery({
        queryKey: queryKeys.petMemories(),
        queryFn: () => listMemories(supabase, coupleId),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PetScreen />
    </HydrationBoundary>
  );
}
