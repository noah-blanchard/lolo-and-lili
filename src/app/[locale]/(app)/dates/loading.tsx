import { Skeleton } from "@/components/ui/skeleton";

// Mirrors CountdownList: title + add control + two-line countdown cards.
export default function DatesLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="px-1 pt-2">
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-12 w-full rounded-cute" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-cute bg-surface p-5 shadow-soft">
            <Skeleton className="mb-2 h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
