import type { OperationalIncident, IncidentSeverity } from "@/types/incidents.types";

const SEVERITY_RANK: Record<IncidentSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

function openSeverityRank(incident: OperationalIncident): number {
  if (incident.status !== "open") return 99;
  return SEVERITY_RANK[incident.severity];
}

/**
 * Sort order: critical open → warning open → info open → resolved (newest first within bucket).
 */
export function compareIncidents(a: OperationalIncident, b: OperationalIncident): number {
  const rankA = openSeverityRank(a);
  const rankB = openSeverityRank(b);
  if (rankA !== rankB) return rankA - rankB;

  if (a.status === "resolved" && b.status === "resolved") {
    const resolvedA = a.resolvedAt ? new Date(a.resolvedAt).getTime() : 0;
    const resolvedB = b.resolvedAt ? new Date(b.resolvedAt).getTime() : 0;
    return resolvedB - resolvedA;
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function sortIncidents(incidents: OperationalIncident[]): OperationalIncident[] {
  return [...incidents].sort(compareIncidents);
}

export function isCriticalOpen(incident: OperationalIncident): boolean {
  return incident.status === "open" && incident.severity === "critical";
}

export function partitionCriticalOpen(
  incidents: OperationalIncident[]
): { criticalOpen: OperationalIncident[]; others: OperationalIncident[] } {
  const criticalOpen: OperationalIncident[] = [];
  const others: OperationalIncident[] = [];

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
