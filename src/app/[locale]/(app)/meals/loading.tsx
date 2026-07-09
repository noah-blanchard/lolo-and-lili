import { Skeleton } from "@/components/ui/skeleton";

// Mirrors WeekPlanner: title + day cards, each with a heading and slot rows.
export default function MealsLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="px-1 pt-2">
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-cute bg-surface p-5 shadow-soft"
          >
            <Skeleton className="h-5 w-1/3" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-8 w-full rounded-cute" />
              <Skeleton className="h-8 w-full rounded-cute" />
              <Skeleton className="h-8 w-full rounded-cute" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
