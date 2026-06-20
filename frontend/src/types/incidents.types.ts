export type IncidentType =
  | "DELAY"
  | "TECHNICAL"
  | "BEHAVIOR"
  | "OTHER"
  | "BOARDING"
  | "CAPACITY"
  | "PAYMENT"
  | "NO_SHOW"
  | "SAFETY";

export type IncidentSource =
  | "MANUAL"
  | "BOARDING_FIELD"
  | "DEPARTURE_HEURISTIC"
  | "MONITORING"
  | "ACTIVITY_SUGGESTION";

export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentClosedReason = "FIXED" | "FALSE_ALARM" | "DUPLICATE" | "WONT_FIX";

export interface AdminIncidentUserRef {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface AdminIncident {
  id: string;
  code: string;
  title: string;
  description: string | null;
  type: IncidentType;
  status: IncidentStatus;
  severity: IncidentSeverity;
  source: IncidentSource;
  sourceRef?: unknown;
  closedReason?: IncidentClosedReason | null;
  relatedReservationId: string | null;
  relatedTripId: string | null;
  createdBy: string;
  assignedToUserId?: string | null;
  resolvedByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  resolution: string | null;
  creator: AdminIncidentUserRef;
  resolver?: AdminIncidentUserRef | null;
  assignee?: AdminIncidentUserRef | null;
}

/** @deprecated use AdminIncidentUserRef */
export type AdminIncidentCreator = AdminIncidentUserRef;

export interface AdminIncidentListResponse {
  incidents: AdminIncident[];
  limit: number;
  offset: number;
}

export const HEURISTIC_KINDS = [
  "near_departure",
  "no_passengers",
  "unknown_readiness",
  "no_boarding_activity",
  "full_not_boarded",
  "boarding_late",
] as const;

export type HeuristicKind = (typeof HEURISTIC_KINDS)[number];

export interface AdminIncidentFilters {
  status?: IncidentStatus;
  type?: IncidentType;
  severity?: IncidentSeverity;
  source?: IncidentSource;
  relatedTripId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface PromoteHeuristicBody {
  relatedTripId: string;
  heuristicKind: HeuristicKind;
  severity?: IncidentSeverity;
  description?: string;
}

export interface CreateAdminIncidentBody {
  title: string;
  description?: string;
  type: IncidentType;
  severity: IncidentSeverity;
  relatedReservationId?: string;
  relatedTripId?: string;
}

export interface PatchAdminIncidentBody {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  title?: string;
  description?: string | null;
  resolution?: string | null;
  type?: IncidentType;
  relatedReservationId?: string | null;
  relatedTripId?: string | null;
}

export interface ImportLocalIncidentPayload {
  incidentCode: string;
  severity: "info" | "warning" | "critical";
  status: "open" | "resolved";
  category: "boarding" | "departure" | "capacity" | "payment" | "system" | "other";
  title: string;
  description?: string;
  relatedTripId?: string;
  createdAt?: string;
  resolvedAt?: string;
}

export interface ImportLocalIncidentsResponse {
  imported: AdminIncident[];
  skipped: string[];
  count: number;
}

/** UI filter state (maps to API on fetch) */
export interface IncidentFiltersState {
  openOnly: boolean;
  severity: IncidentSeverity | "all";
  type: IncidentType | "all";
}

export const DEFAULT_INCIDENT_FILTERS: IncidentFiltersState = {
  openOnly: false,
  severity: "all",
  type: "all",
};

export type ActivityFeedSeverity = "info" | "warning" | "critical";

export interface ActivityFeedEvent {
  id: string;
  type: string;
  severity: ActivityFeedSeverity;
  title: string;
  description?: string;
  timestamp: string;
  actorUserId?: string;
  actorName?: string;
  entityId?: string;
  entityType?: string;
}

export interface ActivityFeedResponse {
  events: ActivityFeedEvent[];
  limit: number;
  offset: number;
  total: number;
}

export interface ActivityFeedFilters {
  limit?: number;
  offset?: number;
  severity?: ActivityFeedSeverity;
  type?: string;
  from?: string;
  to?: string;
}
