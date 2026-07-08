"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { useBucket } from "@/hooks/use-bucket";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { staggerContainer, popIn } from "@/lib/motion";
import { AddBucket } from "./add-bucket";
import { SpinJar } from "./spin-jar";
import { BucketItem } from "./bucket-item";

export function BucketList() {
  const t = useTranslations("bucket");
  const { data, isLoading } = useBucket();
  const todo = (data ?? []).filter((i) => !i.done);
  const done = (data ?? []).filter((i) => i.done);

  return (
    <div className="flex flex-col gap-5">
      <AddBucket />
      {(data?.length ?? 0) > 0 && <SpinJar />}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-cute bg-surface p-5 shadow-soft">
              <Skeleton className="size-5 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState emoji="🪣" title={t("empty")} description={t("emptyHint")} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-3">
          {todo.map((i) => (
            <motion.div key={i.id} variants={popIn}>
              <BucketItem item={i} />
            </motion.div>
          ))}
          {done.length > 0 && (
            <>
              <h2 className="px-1 pt-2 text-sm font-semibold text-muted">
                {t("doneTitle")}
              </h2>
              {done.map((i) => (
                <motion.div key={i.id} variants={popIn}>
                  <BucketItem item={i} />
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
