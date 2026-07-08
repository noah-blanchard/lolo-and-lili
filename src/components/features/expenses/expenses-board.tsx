"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/expenses";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCouple } from "@/components/providers/couple-provider";
import { useDeleteExpense, useExpenses } from "@/hooks/use-expenses";
import { BalanceCard } from "./balance-card";
import { AddExpense } from "./add-expense";

export function ExpensesBoard() {
  const t = useTranslations("expenses");
  const locale = useLocale();
  const { me, partner } = useCouple();
  const { data, isLoading } = useExpenses();
  const del = useDeleteExpense();

  const payerName = (id: string | null) =>
    id === me.id ? me.display_name : id === partner?.id ? partner?.display_name : null;

  return (
    <div className="flex flex-col gap-5">
      <AddExpense />
      <BalanceCard balance={data?.balance ?? null} />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-cute bg-surface p-5 shadow-soft">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      ) : !data?.expenses.length ? (
        <EmptyState emoji="💸" title={t("empty")} description={t("emptyHint")} />
      ) : (
        <div className="flex flex-col gap-3">
          {data.expenses.map((e) => (
            <motion.div key={e.id} layout>
              <Card className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{e.description}</p>
                  <p className="text-xs text-muted">
                    {t("paidBy", { name: payerName(e.payer_id) ?? "?" })}
                  </p>
                </div>
                <span className="font-display font-semibold">
                  {formatMoney(e.amount_cents, e.currency, locale)}
                </span>
                <button
                  type="button"
                  aria-label={t("delete")}
                  onClick={() => del.mutate(e.id)}
                  className="text-muted/50 transition-colors hover:text-busy"
                >
                  <Trash2 className="size-4" />
                </button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
