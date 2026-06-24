export interface PublicLine {
  id: string;
  name: string;
  startCity: string;
  endCity: string;
}

export interface PublicTrip {
  id: string;
  line: PublicLine;
  departureTime: string;
  arrivalTime: string | null;
  totalSeats: number;
  reservedSeats: number;
  remainingSeats: number;
  isFull: boolean;
  /** Not exposed by public API today — reserved for future backend field. */
  isDisabled?: boolean;
}

export interface PublicTripsListResponse {
  trips: PublicTrip[];
  limit: number;
  offset: number;
}

export interface PublicTripsQuery {
  date?: string;
  lineId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export type TripAvailabilityStatus =
  | "available"
  | "almost_full"
  | "full"
  | "unavailable"
  | "past";

export interface TripAvailabilityView {
  status: TripAvailabilityStatus;
  label: string;
  ctaLabel: string;
  ctaDisabled: boolean;
}

export type TripsDateFilterPreset = "today" | "tomorrow" | "next" | "custom";

export interface TripsDateFilterValue {
  preset: TripsDateFilterPreset;
  /** YYYY-MM-DD Europe/Paris when preset is custom or derived from today/tomorrow */
  dateKey: string;
}
