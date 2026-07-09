import { Skeleton } from "@/components/ui/skeleton";

// Mirrors NotesBoard: title + composer + tab toggle + note cards.
export default function NotesLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="px-1 pt-2">
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-24 w-full rounded-cute" />
      <Skeleton className="h-10 w-full rounded-full" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-cute bg-surface p-4 shadow-soft"
          >
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="mt-auto flex items-center justify-between pt-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
