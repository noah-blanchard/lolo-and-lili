import { Skeleton } from "@/components/ui/skeleton";

// Mirrors ChoreList: title + add control + a short list of check-off rows.
export default function ChoresLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="px-1 pt-2">
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-full rounded-cute" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-cute bg-surface p-5 shadow-soft"
            >
              <Skeleton className="size-5 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
