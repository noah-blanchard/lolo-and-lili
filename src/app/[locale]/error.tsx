"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { popIn } from "@/lib/motion";

// Locale-level error boundary. Catches failures in the (app) layout gate itself
// (auth/couple waterfall), so the app frame isn't available here — render a
// self-contained, full-screen fallback. next-intl is still in scope.
export default function LocaleError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
}) {
  const t = useTranslations("errorBoundary");
  const retry = unstable_retry ?? reset;

  useEffect(() => {
    console.error("[locale] boundary caught:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-6">
      <motion.div variants={popIn} initial="hidden" animate="visible" className="w-full">
        <Card className="flex flex-col items-center gap-3 text-center">
          <span className="text-5xl">🩹</span>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
          <Button className="mt-1" onClick={() => retry?.()}>
            {t("retry")}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
