import type { IncidentSeverity, IncidentStatus, IncidentType } from "@/types/incidents.types";

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  DELAY: "Delay",
  TECHNICAL: "Technical",
  BEHAVIOR: "Behavior",
  OTHER: "Other",
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

export function isOpenIncidentStatus(status: IncidentStatus): boolean {
  return status === "OPEN" || status === "IN_PROGRESS";
}

export function isCriticalOpen(incident: {
  status: IncidentStatus;
  severity: IncidentSeverity;
}): boolean {
  return isOpenIncidentStatus(incident.status) && incident.severity === "CRITICAL";
}
