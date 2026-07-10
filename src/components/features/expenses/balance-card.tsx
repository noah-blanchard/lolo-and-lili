"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { toast } from "sonner";
import { celebrateBig } from "@/lib/confetti";
import { formatMoney, type Balance } from "@/lib/expenses";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { celebratePop } from "@/lib/motion";
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
      celebrateBig();
      toast.success(t("settled"));
    } catch {
      toast.error(tc("error"));
    }
  }

  if (!balance) {
    return (
      <motion.div variants={celebratePop} initial="hidden" animate="visible">
        <Card className="flex flex-col items-center gap-1 bg-mint/15 py-6 text-center">
          <span className="text-3xl">🤝</span>
          <p className="font-display font-semibold">{t("even")}</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="flex flex-col gap-3 bg-primary/10">
      <div className="text-center">
        <p className="text-sm text-muted">{t("owes", { debtor: nameOf(balance.debtorId), creditor: nameOf(balance.creditorId) })}</p>
        <AnimatedNumber
          value={balance.amountCents}
          format={(n) => formatMoney(Math.round(n), balance.currency, locale)}
          className="block pt-1 font-display text-3xl font-bold text-primary"
        />
      </div>
      <Button onClick={onSettle} loading={settle.isPending} className="w-full">
        {t("settleUp")}
      </Button>
    </Card>
  );
}
