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
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
  CLOSED: "Clôturé",
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  LOW: "Faible",
  MEDIUM: "Moyenne",
  HIGH: "Élevée",
  CRITICAL: "Critique",
};

export const INCIDENT_SOURCE_FILTER_OPTIONS: { value: IncidentSource | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "BOARDING_FIELD", label: "Terrain" },
  { value: "DEPARTURE_HEURISTIC", label: "Départs" },
  { value: "MONITORING", label: "Monitoring" },
  { value: "MANUAL", label: "Admin" },
];

export const INCIDENT_STATUS_FILTER_OPTIONS: {
  value: IncidentStatus | "all" | "active";
  label: string;
}[] = [
  { value: "all", label: "Tous" },
  { value: "active", label: "Actifs (ouvert + en cours)" },
  { value: "OPEN", label: "Ouvert" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "RESOLVED", label: "Résolu" },
  { value: "CLOSED", label: "Clôturé" },
];

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
