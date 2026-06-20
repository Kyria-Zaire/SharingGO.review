import type { AdminIncident, HeuristicKind } from "@/types/incidents.types";
import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";

export function parseHeuristicIdFromSourceRef(sourceRef: unknown): HeuristicKind | null {
  if (!sourceRef || typeof sourceRef !== "object") return null;
  const heuristicId = (sourceRef as { heuristicId?: unknown }).heuristicId;
  return typeof heuristicId === "string" ? (heuristicId as HeuristicKind) : null;
}

export function promotedIncidentKey(tripId: string, heuristicKind: HeuristicKind): string {
  return `${tripId}:${heuristicKind}`;
}

export function buildPromotedIncidentMap(incidents: AdminIncident[]): Map<string, AdminIncident> {
  const map = new Map<string, AdminIncident>();

  for (const incident of incidents) {
    if (incident.source !== "DEPARTURE_HEURISTIC") continue;
    if (!isOpenIncidentStatus(incident.status)) continue;
    if (!incident.relatedTripId) continue;

    const heuristicKind = parseHeuristicIdFromSourceRef(incident.sourceRef);
    if (!heuristicKind) continue;

    map.set(promotedIncidentKey(incident.relatedTripId, heuristicKind), incident);
  }

  return map;
}

export function getPromotedIncidentsForTrip(
  tripId: string,
  promotedMap: Map<string, AdminIncident>
): AdminIncident[] {
  const results: AdminIncident[] = [];
  for (const [key, incident] of promotedMap) {
    if (key.startsWith(`${tripId}:`)) results.push(incident);
  }
  return results;
}
