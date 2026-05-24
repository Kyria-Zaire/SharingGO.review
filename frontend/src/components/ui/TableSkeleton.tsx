import { cn } from "@/lib/cn";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 6, columns = 7, className }: TableSkeletonProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border", className)}>
      <div className="border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-3 flex-1 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-4 px-4 py-4">
            {Array.from({ length: columns }).map((_, col) => (
              <div key={col} className="h-4 flex-1 animate-pulse rounded bg-muted/80" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
