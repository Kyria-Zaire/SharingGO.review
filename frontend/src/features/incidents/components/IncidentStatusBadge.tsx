import { cn } from "@/lib/cn";
import { INCIDENT_STATUS_LABELS } from "@/features/incidents/constants/incident-labels";
import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import type { IncidentStatus } from "@/types/incidents.types";

const statusClass: Record<IncidentStatus, string> = {
  OPEN: "border-warning/30 bg-warning/10 text-warning",
  IN_PROGRESS: "border-warning/30 bg-warning/10 text-warning",
  RESOLVED: "border-primary/30 bg-primary/10 text-primary",
  CLOSED: "border-border bg-muted text-muted-foreground",
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        statusClass[status]
      )}
    >
      {isOpenIncidentStatus(status) ? INCIDENT_STATUS_LABELS[status] : INCIDENT_STATUS_LABELS[status]}
    </span>
  );
}
