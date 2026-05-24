import { cn } from "@/lib/cn";
import type { IncidentStatus } from "@/types/incidents.types";

const statusConfig: Record<IncidentStatus, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "border-warning/30 bg-warning/10 text-warning",
  },
  resolved: {
    label: "Resolved",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
};

export interface IncidentStatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

export function IncidentStatusBadge({ status, className }: IncidentStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
