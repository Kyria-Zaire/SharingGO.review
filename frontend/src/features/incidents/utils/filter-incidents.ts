import type { IncidentFiltersState, OperationalIncident } from "@/types/incidents.types";

export function filterIncidents(
  incidents: OperationalIncident[],
  filters: IncidentFiltersState
): OperationalIncident[] {
  return incidents.filter((incident) => {
    if (filters.openOnly && incident.status !== "open") return false;
    if (filters.severity !== "all" && incident.severity !== filters.severity) return false;
    if (filters.category !== "all" && incident.category !== filters.category) return false;
    return true;
  });
}
