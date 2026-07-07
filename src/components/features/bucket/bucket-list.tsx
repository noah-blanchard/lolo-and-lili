"use client";

import { useTranslations } from "next-intl";
import { useBucket } from "@/hooks/use-bucket";
import { EmptyState } from "@/components/ui/empty-state";
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

      {isLoading ? null : !data?.length ? (
        <EmptyState emoji="🪣" title={t("empty")} description={t("emptyHint")} />
      ) : (
        <div className="flex flex-col gap-3">
          {todo.map((i) => (
            <BucketItem key={i.id} item={i} />
          ))}
          {done.length > 0 && (
            <>
              <h2 className="px-1 pt-2 text-sm font-semibold text-muted">
                {t("doneTitle")}
              </h2>
              {done.map((i) => (
                <BucketItem key={i.id} item={i} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
