export type IncidentSeverity = "info" | "warning" | "critical";

export type IncidentStatus = "open" | "resolved";

export type IncidentCategory =
  | "boarding"
  | "departure"
  | "capacity"
  | "payment"
  | "system"
  | "other";

/**
 * Local operational incident (V1 — no backend persistence).
 * Optional fields reserved for future operator ownership, audit, sync, realtime.
 */
export interface OperationalIncident {
  id: string;
  incidentCode: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: IncidentCategory;
  title: string;
  description?: string;
  relatedTripId?: string;
  createdAt: string;
  resolvedAt?: string;
  /** Future: operator assignment / ownership */
  assignedTo?: string;
  /** Future: operator display metadata */
  assignedToLabel?: string;
  /** Future: internal notes thread */
  notes?: string[];
  /** Future: collapsed in resolved section */
  collapsed?: boolean;
}

export interface CreateOperationalIncidentInput {
  severity: IncidentSeverity;
  category: IncidentCategory;
  title: string;
  description?: string;
  relatedTripId?: string;
}

export interface IncidentFiltersState {
  openOnly: boolean;
  severity: IncidentSeverity | "all";
  category: IncidentCategory | "all";
}

export const DEFAULT_INCIDENT_FILTERS: IncidentFiltersState = {
  openOnly: false,
  severity: "all",
  category: "all",
};
