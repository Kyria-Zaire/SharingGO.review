import { INCIDENTS_COUNTER_KEY } from "@/features/incidents/constants/incidents-config";
import type { OperationalIncident } from "@/types/incidents.types";

function parseIncidentCodeNumber(code: string): number {
  const match = /^INC-(\d+)$/.exec(code.trim());
  return match?.[1] ? Number.parseInt(match[1], 10) : 0;
}

export function formatIncidentCode(sequence: number): string {
  return `INC-${String(sequence).padStart(4, "0")}`;
}

/**
 * Generates the next readable incident code. Counter persists in localStorage;
 * never reuses codes even after resolved incidents are cleared.
 */
export function generateNextIncidentCode(existingIncidents: OperationalIncident[]): string {
  const storedCounter = Number.parseInt(localStorage.getItem(INCIDENTS_COUNTER_KEY) ?? "0", 10);
  const maxFromIncidents = existingIncidents.reduce(
    (max, incident) => Math.max(max, parseIncidentCodeNumber(incident.incidentCode)),
    0
  );
  const next = Math.max(storedCounter, maxFromIncidents) + 1;
  localStorage.setItem(INCIDENTS_COUNTER_KEY, String(next));
  return formatIncidentCode(next);
}
