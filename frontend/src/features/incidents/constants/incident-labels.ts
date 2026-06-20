import type {
  IncidentSeverity,
  IncidentSource,
  IncidentStatus,
  IncidentType,
} from "@/types/incidents.types";

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  DELAY: "Retard",
  TECHNICAL: "Technique",
  BEHAVIOR: "Comportement",
  OTHER: "Autre",
  BOARDING: "Embarquement",
  CAPACITY: "Capacité",
  PAYMENT: "Paiement",
  NO_SHOW: "No-show",
  SAFETY: "Sécurité",
};

export const INCIDENT_SOURCE_LABELS: Record<IncidentSource, string> = {
  BOARDING_FIELD: "Terrain",
  MANUAL: "Admin",
  MONITORING: "Monitoring",
  DEPARTURE_HEURISTIC: "Départs",
  ACTIVITY_SUGGESTION: "Activité",
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export function getIncidentTypeLabel(type: IncidentType): string {
  return INCIDENT_TYPE_LABELS[type] ?? type;
}

export function getIncidentSourceLabel(source: IncidentSource | undefined): string {
  if (!source) return "—";
  return INCIDENT_SOURCE_LABELS[source] ?? source;
}

export function isOpenIncidentStatus(status: IncidentStatus): boolean {
  return status === "OPEN" || status === "IN_PROGRESS";
}

export function isCriticalOpen(incident: {
  status: IncidentStatus;
  severity: IncidentSeverity;
}): boolean {
  return isOpenIncidentStatus(incident.status) && incident.severity === "CRITICAL";
}

export const ACTIVITY_INCIDENT_EVENT_LABELS: Record<string, string> = {
  INCIDENT_CREATED: "Incident créé",
  INCIDENT_RESOLVED: "Incident résolu",
  INCIDENT_CLOSED: "Incident clôturé",
  INCIDENT_SUGGESTED: "Suggestion incident",
};
