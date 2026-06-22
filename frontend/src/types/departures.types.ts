import type { HeuristicKind } from "@/types/incidents.types";
import type { TripLifecycleStatus } from "@/types/trips.types";

/** UX-only departure readiness — not persisted, not backend truth. */
export type DepartureReadinessStatus =
  | "READY"
  | "BOARDING_IN_PROGRESS"
  | "WAITING_PASSENGERS"
  | "EMPTY"
  | "UNKNOWN";

/** Reserved for future partial / lifecycle states (not implemented in V1). */
export type DepartureReadinessStatusFuture =
  | DepartureReadinessStatus
  | "DEGRADED"
  | "DELAYED"
  | "INCIDENT"
  | "CLOSED";

/** Extensible incident severity for future alerting tiers. */
export type DepartureIncidentSeverity = "info" | "warning" | "critical";

export interface DepartureIncident {
  id: string;
  label: string;
  heuristicKind: HeuristicKind;
  severity: DepartureIncidentSeverity;
}

export interface DepartureFilters {
  lineId?: string;
  includeDisabled?: boolean;
  upcomingOnly?: boolean;
  readiness?: DepartureReadinessStatus | "";
}

export interface DepartureTripView {
  tripId: string;
  lineName: string;
  routeLabel: string;
  departureTime: string;
  totalSeats: number;
  occupiedSeats: number;
  boardedCount: number;
  remainingBoardingCount: number;
  activePendingSeats: number;
  percentBoarded: number;
  readiness: DepartureReadinessStatus;
  boardingComplete: boolean;
  nearDeparture: boolean;
  isFull: boolean;
  isDisabled: boolean;
  incidents: DepartureIncident[];
  occupancyLoaded: boolean;
  lifecycleStatus: TripLifecycleStatus;
}

export interface DepartureBoardData {
  departures: DepartureTripView[];
  fetchedAt: string;
}

export const DEPARTURE_READINESS_PRIORITY: Record<DepartureReadinessStatus, number> = {
  BOARDING_IN_PROGRESS: 0,
  WAITING_PASSENGERS: 1,
  READY: 2,
  EMPTY: 3,
  UNKNOWN: 4,
};

export const NEAR_DEPARTURE_THRESHOLD_MINUTES = 15;
