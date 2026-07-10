"use client";

import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/expenses";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { staggerContainer, springBouncy, tapScale } from "@/lib/motion";
import { useCouple } from "@/components/providers/couple-provider";
import { useDeleteExpense, useExpenses } from "@/hooks/use-expenses";
import { BalanceCard } from "./balance-card";
import { AddExpense } from "./add-expense";

// Expense rows slide in from the left and out to the right.
const expenseRow: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: springBouncy },
  exit: { opacity: 0, x: 28, transition: { duration: 0.18, ease: "easeIn" } },
};

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
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-3">
          <AnimatePresence initial={false} mode="popLayout">
            {data.expenses.map((e) => (
              <motion.div key={e.id} variants={expenseRow} initial="hidden" animate="visible" exit="exit" layout>
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
                  <motion.button
                    type="button"
                    aria-label={t("delete")}
                    whileTap={tapScale}
                    onClick={() => del.mutate(e.id)}
                    className="text-muted/50 transition-colors hover:text-busy"
                  >
                    <Trash2 className="size-4" />
                  </motion.button>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
