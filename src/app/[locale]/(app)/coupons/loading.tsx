import { Skeleton } from "@/components/ui/skeleton";

// Mirrors CouponsBoard: title + mint control + tab toggle + coupon cards.
export default function CouponsLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="px-1 pt-2">
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-12 w-full rounded-cute" />
      <Skeleton className="h-10 w-full rounded-full" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-cute bg-surface p-5 shadow-soft">
            <Skeleton className="mb-2 h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
