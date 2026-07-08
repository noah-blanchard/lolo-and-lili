import { Skeleton } from "@/components/ui/skeleton";

// Instant loading boundary — lets Next commit the navigation immediately
// (so the URL + bottom-nav highlight update right away) while the dynamic
// page streams in behind this skeleton.
export default function AppLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="px-1 pt-2">
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="rounded-cute bg-surface p-5 shadow-soft">
        <Skeleton className="mb-4 h-5 w-24" />
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="mt-4 h-10 w-full rounded-full" />
      </div>
      <div className="rounded-cute bg-surface p-5 shadow-soft">
        <Skeleton className="mb-3 h-5 w-28" />
        <Skeleton className="mb-1 h-3 w-48" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Skeleton className="h-16 rounded-cute" />
          <Skeleton className="h-16 rounded-cute" />
          <Skeleton className="h-16 rounded-cute" />
          <Skeleton className="h-16 rounded-cute" />
          <Skeleton className="h-16 rounded-cute" />
          <Skeleton className="h-16 rounded-cute" />
        </div>
      </div>
      <div className="rounded-cute bg-surface p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 shrink-0 rounded-cute" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}
