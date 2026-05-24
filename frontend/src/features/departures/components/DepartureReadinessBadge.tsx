import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { DepartureReadinessStatus } from "@/types/departures.types";

const labelByStatus: Record<DepartureReadinessStatus, string> = {
  READY: "Ready",
  BOARDING_IN_PROGRESS: "Boarding",
  WAITING_PASSENGERS: "Waiting",
  EMPTY: "Empty",
  UNKNOWN: "Unknown",
};

const variantByStatus: Record<
  DepartureReadinessStatus,
  "success" | "warning" | "destructive" | "muted" | "default"
> = {
  READY: "success",
  BOARDING_IN_PROGRESS: "warning",
  WAITING_PASSENGERS: "default",
  EMPTY: "muted",
  UNKNOWN: "muted",
};

const classByStatus: Partial<Record<DepartureReadinessStatus, string>> = {
  WAITING_PASSENGERS: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
};

export interface DepartureReadinessBadgeProps {
  status: DepartureReadinessStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function DepartureReadinessBadge({
  status,
  className,
  size = "md",
}: DepartureReadinessBadgeProps) {
  // V1 maps DepartureReadinessStatus only — extend labelByStatus for future lifecycle states.
  return (
    <Badge
      variant={variantByStatus[status]}
      className={cn(
        "font-semibold uppercase tracking-wide",
        classByStatus[status],
        size === "lg" && "px-3 py-1 text-sm",
        size === "sm" && "text-[10px]",
        className
      )}
    >
      {labelByStatus[status]}
    </Badge>
  );
}
