import { cn } from "@/lib/cn";

interface BoardingProgressBarProps {
  percent: number;
  className?: string;
}

/**
 * Boarding progress bar (V1: static width transition).
 * Future: subtle pulse/animation on percent change for field ops feedback.
 */
export function BoardingProgressBar({ percent, className }: BoardingProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Embarquement</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
