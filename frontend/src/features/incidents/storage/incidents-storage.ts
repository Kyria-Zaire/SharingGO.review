import { INCIDENTS_STORAGE_KEY, INCIDENTS_UPDATED_EVENT } from "@/features/incidents/constants/incidents-config";
import type { OperationalIncident } from "@/types/incidents.types";

const ALLOWED_SEVERITIES = new Set(["info", "warning", "critical"]);
const ALLOWED_STATUSES = new Set(["open", "resolved"]);
const ALLOWED_CATEGORIES = new Set([
  "boarding",
  "departure",
  "capacity",
  "payment",
  "system",
  "other",
]);

function isValidIncident(value: unknown): value is OperationalIncident {
  if (!value || typeof value !== "object") return false;
  const incident = value as OperationalIncident;
  return (
    typeof incident.id === "string" &&
    typeof incident.incidentCode === "string" &&
    ALLOWED_SEVERITIES.has(incident.severity) &&
    ALLOWED_STATUSES.has(incident.status) &&
    ALLOWED_CATEGORIES.has(incident.category) &&
    typeof incident.title === "string" &&
    typeof incident.createdAt === "string"
  );
}

export function loadIncidentsFromStorage(): OperationalIncident[] {
  try {
    const raw = localStorage.getItem(INCIDENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidIncident);
  } catch {
    return [];
  }
}

export function saveIncidentsToStorage(incidents: OperationalIncident[]): void {
  localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(incidents));
  window.dispatchEvent(new CustomEvent(INCIDENTS_UPDATED_EVENT));
}

export function countOpenIncidents(incidents: OperationalIncident[]): number {
  return incidents.filter((incident) => incident.status === "open").length;
}

export function readOpenIncidentCount(): number {
  return countOpenIncidents(loadIncidentsFromStorage());
}
