"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { popIn } from "@/lib/motion";

// Feature-level error boundary. Rendered inside (app)/layout.tsx, so the bottom
// nav and providers stay mounted — a thrown page never white-screens the app.
export default function AppError({
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
    console.error("[app] boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
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
