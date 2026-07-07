"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { celebrate } from "@/lib/confetti";
import { formatMoney, type Balance } from "@/lib/expenses";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCouple } from "@/components/providers/couple-provider";
import { useSettleUp } from "@/hooks/use-expenses";

export function BalanceCard({ balance }: { balance: Balance | null }) {
  const t = useTranslations("expenses");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { me, partner } = useCouple();
  const settle = useSettleUp();

  const nameOf = (id: string) =>
    id === me.id ? me.display_name ?? tc("save") : partner?.display_name ?? t("partner");

  async function onSettle() {
    try {
      await settle.mutateAsync();
      celebrate();
      toast.success(t("settled"));
    } catch {
      toast.error(tc("error"));
    }
  }

  if (!balance) {
    return (
      <Card className="flex flex-col items-center gap-1 bg-mint/15 py-6 text-center">
        <span className="text-3xl">🤝</span>
        <p className="font-display font-semibold">{t("even")}</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 bg-primary/10">
      <div className="text-center">
        <p className="text-sm text-muted">{t("owes", { debtor: nameOf(balance.debtorId), creditor: nameOf(balance.creditorId) })}</p>
        <p className="pt-1 font-display text-3xl font-bold text-primary">
          {formatMoney(balance.amountCents, balance.currency, locale)}
        </p>
      </div>
      <Button onClick={onSettle} disabled={settle.isPending} className="w-full">
        {t("settleUp")}
      </Button>
    </Card>
  );
}
