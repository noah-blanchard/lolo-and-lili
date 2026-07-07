import { setRequestLocale } from "next-intl/server";
import { PetScreen } from "@/components/features/pet/pet-screen";

export default async function PetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PetScreen />;
}
