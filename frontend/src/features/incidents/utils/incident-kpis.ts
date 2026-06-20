import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import type { AdminIncident } from "@/types/incidents.types";

export interface IncidentKpiSnapshot {
  open: number;
  inProgress: number;
  critical: number;
  resolvedToday: number;
}

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function computeIncidentKpis(incidents: AdminIncident[]): IncidentKpiSnapshot {
  let open = 0;
  let inProgress = 0;
  let critical = 0;
  let resolvedToday = 0;

  for (const incident of incidents) {
    if (incident.status === "OPEN") open += 1;
    if (incident.status === "IN_PROGRESS") inProgress += 1;
    if (isOpenIncidentStatus(incident.status) && incident.severity === "CRITICAL") {
      critical += 1;
    }
    if (incident.status === "RESOLVED" && incident.resolvedAt && isToday(incident.resolvedAt)) {
      resolvedToday += 1;
    }
  }

  return { open, inProgress, critical, resolvedToday };
}
