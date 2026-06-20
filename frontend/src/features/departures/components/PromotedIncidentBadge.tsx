import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { AdminIncident } from "@/types/incidents.types";

interface PromotedIncidentBadgeProps {
  incident: AdminIncident;
  className?: string;
}

export function PromotedIncidentBadge({ incident, className }: PromotedIncidentBadgeProps) {
  const label = incident.code || "INCIDENT OUVERT";

  return (
    <Badge
      variant="warning"
      className={cn("font-mono font-semibold uppercase tracking-wide", className)}
      title={incident.title}
    >
      {label}
    </Badge>
  );
}
