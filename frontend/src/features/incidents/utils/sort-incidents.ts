import {
  isCriticalOpen,
  isOpenIncidentStatus,
} from "@/features/incidents/constants/incident-labels";
import type { AdminIncident, IncidentSeverity } from "@/types/incidents.types";

const SEVERITY_RANK: Record<IncidentSeverity, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function openSeverityRank(incident: AdminIncident): number {
  if (!isOpenIncidentStatus(incident.status)) return 99;
  return SEVERITY_RANK[incident.severity];
}

export function compareIncidents(a: AdminIncident, b: AdminIncident): number {
  const rankA = openSeverityRank(a);
  const rankB = openSeverityRank(b);
  if (rankA !== rankB) return rankA - rankB;

  if (a.status === "RESOLVED" || a.status === "CLOSED") {
    const resolvedA = a.resolvedAt ? new Date(a.resolvedAt).getTime() : 0;
    const resolvedB = b.resolvedAt ? new Date(b.resolvedAt).getTime() : 0;
    return resolvedB - resolvedA;
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function sortIncidents(incidents: AdminIncident[]): AdminIncident[] {
  return [...incidents].sort(compareIncidents);
}

export function partitionCriticalOpen(incidents: AdminIncident[]): {
  criticalOpen: AdminIncident[];
  others: AdminIncident[];
} {
  const criticalOpen: AdminIncident[] = [];
  const others: AdminIncident[] = [];

  for (const incident of incidents) {
    if (isCriticalOpen(incident)) {
      criticalOpen.push(incident);
    } else {
      others.push(incident);
    }
  }

  return {
    criticalOpen: sortIncidents(criticalOpen),
    others: sortIncidents(others),
  };
}
