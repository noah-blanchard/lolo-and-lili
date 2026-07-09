import { Skeleton } from "@/components/ui/skeleton";

// Mirrors PetScreen: title row + the pet scene card + a meters card.
export default function PetLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-1 pt-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="size-7 rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-3 rounded-cute bg-surface p-5 shadow-soft">
        <Skeleton className="size-40 rounded-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex flex-col gap-4 rounded-cute bg-surface p-5 shadow-soft">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 flex-1 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
