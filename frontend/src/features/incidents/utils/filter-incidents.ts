import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import { formatIncidentTripDisplay } from "@/features/incidents/utils/format-incident-trip";
import type { AdminIncident, IncidentFiltersState } from "@/types/incidents.types";
import type { AdminTrip } from "@/types/trips.types";

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function matchesTextSearch(incident: AdminIncident, query: string): boolean {
  const haystack = [incident.code, incident.title, incident.description ?? ""]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function matchesTripSearch(
  incident: AdminIncident,
  query: string,
  tripById: Map<string, AdminTrip>
): boolean {
  if (!incident.relatedTripId) return false;
  const trip = tripById.get(incident.relatedTripId);
  const display = formatIncidentTripDisplay(trip, incident.relatedTripId);
  const haystack = [display.primary, display.secondary ?? "", trip?.line.name ?? ""]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function matchesStatusFilter(
  incident: AdminIncident,
  status: IncidentFiltersState["status"]
): boolean {
  if (status === "all") return true;
  if (status === "active") return isOpenIncidentStatus(incident.status);
  return incident.status === status;
}

export function filterIncidents(
  incidents: AdminIncident[],
  filters: IncidentFiltersState,
  tripById: Map<string, AdminTrip> = new Map()
): AdminIncident[] {
  const textQuery = normalizeSearch(filters.searchText);
  const tripQuery = normalizeSearch(filters.tripSearch);

  return incidents.filter((incident) => {
    if (filters.source !== "all" && incident.source !== filters.source) return false;
    if (!matchesStatusFilter(incident, filters.status)) return false;
    if (filters.severity !== "all" && incident.severity !== filters.severity) return false;
    if (filters.type !== "all" && incident.type !== filters.type) return false;
    if (textQuery && !matchesTextSearch(incident, textQuery)) return false;
    if (tripQuery && !matchesTripSearch(incident, tripQuery, tripById)) return false;
    return true;
  });
}
