"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Heart, Users } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import {
  createCoupleAction,
  joinCoupleAction,
} from "@/app/actions/couples";
import { isOk } from "@/lib/api/result";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export function Onboarding() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState("");

  function run<T>(action: () => Promise<import("@/lib/api/result").ApiResult<T>>) {
    startTransition(async () => {
      const res = await action();
      if (isOk(res)) {
        router.refresh();
      } else {
        const message =
          res.error.code === "CONFLICT"
            ? t("joinFull")
            : res.error.message || tc("error");
        toast.error(message);
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-5 px-6">
      <header className="text-center">
        <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-muted">{t("subtitle")}</p>
      </header>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Heart className="size-5 text-primary" />
          <CardTitle>{t("createTitle")}</CardTitle>
        </div>
        <CardDescription>{t("createSubtitle")}</CardDescription>
        <Button
          className="w-full"
          disabled={pending}
          onClick={() => run(() => createCoupleAction())}
        >
          {t("createCta")}
        </Button>
      </Card>

      <div className="text-center text-sm font-semibold text-muted">
        {t("or")}
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-secondary-foreground" />
          <CardTitle>{t("joinTitle")}</CardTitle>
        </div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("joinPlaceholder")}
          className="h-12 w-full rounded-cute bg-surface-muted px-4 outline-none placeholder:text-muted/60"
        />
        <Button
          variant="secondary"
          className="w-full"
          disabled={pending || code.trim().length < 4}
          onClick={() => run(() => joinCoupleAction({ inviteCode: code }))}
        >
          {t("joinCta")}
        </Button>
      </Card>
    </div>
  );
}
