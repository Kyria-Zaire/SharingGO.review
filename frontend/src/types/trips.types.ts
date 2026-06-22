export interface AdminLine {
  id: string;
  name: string;
  startCity: string;
  endCity: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminTrip {
  id: string;
  lineId: string;
  line: AdminLine;
  driverId: string | null;
  driver: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    userType: string;
  } | null;
  departureTime: string;
  arrivalTime: string | null;
  totalSeats: number;
  lifecycleStatus: TripLifecycleStatus;
  boardingStartedAt: string | null;
  departedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TripLifecycleStatus =
  | "WAITING"
  | "BOARDING"
  | "DEPARTED"
  | "COMPLETED"
  | "CANCELLED";

export interface AdminTripListResponse {
  trips: AdminTrip[];
}

export interface AdminLinesListResponse {
  lines: AdminLine[];
}

export interface TripOccupancy {
  trip: {
    id: string;
    departureTime: string;
    arrivalTime: string | null;
    totalSeats: number;
    deletedAt: string | null;
    line: AdminLine;
  };
  totalSeats: number;
  confirmedSeats: number;
  usedSeats: number;
  activePendingSeats: number;
  occupiedSeats: number;
  remainingSeats: number;
  isFull: boolean;
}

/** UI-only trip status for admin table (not a backend enum). */
export type TripUiStatus = "active" | "disabled" | "full" | "past" | "upcoming";

export interface AdminTripsListFilters {
  lineId?: string;
  from?: string;
  to?: string;
  includeDisabled?: boolean;
}
