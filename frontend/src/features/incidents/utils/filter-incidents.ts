import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import type { AdminIncident, IncidentFiltersState } from "@/types/incidents.types";

export function filterIncidents(
  incidents: AdminIncident[],
  filters: IncidentFiltersState
): AdminIncident[] {
  return incidents.filter((incident) => {
    if (filters.openOnly && !isOpenIncidentStatus(incident.status)) return false;
    if (filters.severity !== "all" && incident.severity !== filters.severity) return false;
    if (filters.type !== "all" && incident.type !== filters.type) return false;
    return true;
  });
}
