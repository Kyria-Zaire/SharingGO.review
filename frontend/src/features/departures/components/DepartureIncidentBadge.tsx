import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { DepartureIncident, DepartureIncidentSeverity } from "@/types/departures.types";

const variantBySeverity: Record<
  DepartureIncidentSeverity,
  "default" | "warning" | "destructive" | "muted"
> = {
  info: "muted",
  warning: "warning",
  critical: "destructive",
};

interface DepartureIncidentBadgeProps {
  incident: DepartureIncident;
  className?: string;
}

export function DepartureIncidentBadge({ incident, className }: DepartureIncidentBadgeProps) {
  return (
    <Badge variant={variantBySeverity[incident.severity]} className={cn("font-normal", className)}>
      {incident.label}
    </Badge>
  );
}
