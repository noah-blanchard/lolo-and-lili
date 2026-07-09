import { Skeleton } from "@/components/ui/skeleton";

// Hubs fetch nothing — mirror the header + HubCard grid so the swap is
// imperceptible (Nous has five tiles).
export default function NousLoading() {
  return (
    <div className="flex flex-col gap-5">
      <header className="px-1 pt-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </header>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-cute bg-surface p-4 shadow-soft"
          >
            <Skeleton className="size-11 rounded-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
