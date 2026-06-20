import { getIncidentTypeLabel } from "@/features/incidents/constants/incident-labels";
import type { IncidentType } from "@/types/incidents.types";

export function IncidentTypeBadge({ type }: { type: IncidentType }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {getIncidentTypeLabel(type)}
    </span>
  );
}
