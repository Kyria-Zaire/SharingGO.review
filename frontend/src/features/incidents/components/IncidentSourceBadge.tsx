import { getIncidentSourceLabel } from "@/features/incidents/constants/incident-labels";
import type { IncidentSource } from "@/types/incidents.types";

export function IncidentSourceBadge({ source }: { source: IncidentSource }) {
  return (
    <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      {getIncidentSourceLabel(source)}
    </span>
  );
}
