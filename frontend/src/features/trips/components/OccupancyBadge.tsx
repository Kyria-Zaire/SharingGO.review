import { cn } from "@/lib/cn";
import { getOccupancyVisualLevel } from "@/features/trips/utils/occupancy-visual";

const levelClasses = {
  low: "border-primary/40 bg-primary/10 text-primary",
  medium: "border-warning/40 bg-warning/10 text-warning",
  full: "border-destructive/40 bg-destructive/10 text-destructive",
} as const;

export interface OccupancyBadgeProps {
  occupied: number;
  total: number;
  className?: string;
}

/**
 * Visual occupancy indicator only — colors derived from occupied/total ratio.
 * Backend occupancy API remains the source of truth for seat counts.
 */
export function OccupancyBadge({ occupied, total, className }: OccupancyBadgeProps) {
  const level = getOccupancyVisualLevel(occupied, total);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-medium tabular-nums",
        levelClasses[level],
        className
      )}
    >
      {occupied} / {total}
    </span>
  );
}
