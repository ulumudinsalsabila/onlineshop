import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingState({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4", className)} role="status" aria-live="polite">
      <span className="sr-only">Loading content…</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="space-y-3 border border-border bg-card p-4">
          <Skeleton className="aspect-[4/3] w-full rounded-sm" />
          <Skeleton className="h-4 w-2/3 rounded-sm" />
          <Skeleton className="h-3 w-1/3 rounded-sm" />
        </div>
      ))}
    </div>
  );
}
