import { Skeleton } from "@/components/ui/skeleton";

// Mirrors ExpensesBoard: title + add control + balance card + expense rows.
export default function ExpensesLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="px-1 pt-2">
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-12 w-full rounded-cute" />
      <div className="rounded-cute bg-surface p-5 shadow-soft">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-cute bg-surface p-5 shadow-soft"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
