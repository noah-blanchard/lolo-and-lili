import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/features/auth/login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("app");

  return (
    <>
      <header className="text-center">
        <h1 className="font-display text-4xl font-bold text-primary">
          {t("name")}
        </h1>
        <p className="mt-1 text-muted">{t("tagline")}</p>
      </header>
      <LoginForm />
    </>
  );
}
