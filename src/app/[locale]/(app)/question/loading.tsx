import { Skeleton } from "@/components/ui/skeleton";

// Mirrors QuestionBoard's loading shape: title + prompt card + answer card.
export default function QuestionLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="px-1 pt-2">
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="rounded-cute bg-primary/10 p-5 shadow-soft">
        <Skeleton className="mb-2 size-8 rounded-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="rounded-cute bg-surface p-5 shadow-soft">
        <Skeleton className="mb-3 h-24 w-full rounded-cute" />
        <Skeleton className="h-10 w-full rounded-cute" />
      </div>
    </div>
  );
}
