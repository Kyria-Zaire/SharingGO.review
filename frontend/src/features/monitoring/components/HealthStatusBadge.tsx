import type { MonitoringStatus } from "@/types/system.types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const labelByStatus: Record<MonitoringStatus, string> = {
  ok: "OK",
  warning: "WARNING",
  error: "ERROR",
  unknown: "UNKNOWN",
  degraded: "DEGRADED",
};

const variantByStatus: Record<
  MonitoringStatus,
  "success" | "warning" | "destructive" | "muted" | "default"
> = {
  ok: "success",
  warning: "warning",
  error: "destructive",
  unknown: "muted",
  degraded: "warning",
};

export interface HealthStatusBadgeProps {
  status: MonitoringStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function HealthStatusBadge({ status, className, size = "md" }: HealthStatusBadgeProps) {
  return (
    <Badge
      variant={variantByStatus[status]}
      className={cn(
        "font-semibold uppercase tracking-wide",
        size === "lg" && "px-4 py-1.5 text-sm",
        size === "sm" && "text-[10px]",
        className
      )}
    >
      {labelByStatus[status]}
    </Badge>
  );
}
