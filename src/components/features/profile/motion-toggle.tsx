"use client";

import { useTranslations } from "next-intl";
import { useMotionPref } from "@/components/providers/motion-pref-provider";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

/** Lets the user force full motion even when the OS requests reduced motion. */
export function MotionToggle() {
  const t = useTranslations("profile");
  const { forceFullMotion, setForceFullMotion } = useMotionPref();

  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <CardTitle>{t("motion")}</CardTitle>
        <CardDescription>{t("motionHint")}</CardDescription>
      </div>
      <Switch
        checked={forceFullMotion}
        onChange={setForceFullMotion}
        label={t("motion")}
      />
    </Card>
  );
}
