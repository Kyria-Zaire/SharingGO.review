/** GET /api/reservations/pending/:id — shape backend `PendingReservation`. */
export interface PendingReservation {
  id: string;
  trip: {
    id: string;
    departureTime: string;
  };
  expiresAt: string;
  isExpired: boolean;
}

/** POST /api/reservations/pending — shape backend `CreatePendingResult`. */
export interface CreatePendingReservationResponse {
  pendingReservationId: string;
  expiresAt: string;
  remainingSeats: number;
}

export interface UserReservationTripLine {
  id: string;
  name: string;
  startCity: string;
  endCity: string;
}

export interface UserReservationTrip {
  id: string;
  departureTime: string;
  arrivalTime: string | null;
  line: UserReservationTripLine;
}

export interface UserReservationPayment {
  id: string;
  status: string;
  type: string;
  amount: string;
  currency: string;
  createdAt: string;
}

/** Statuts backend `RefundStatus` (Prisma). */
export type RefundStatus = "NONE" | "PENDING" | "REFUNDED" | "CREDITED";

export interface UserReservationListItem {
  id: string;
  status: string;
  refundStatus: RefundStatus;
  trip: UserReservationTrip;
  payment: UserReservationPayment | null;
  createdAt: string;
}

/** GET /api/reservations/:id — liste + updatedAt. */
export interface UserReservationDetail extends UserReservationListItem {
  updatedAt: string;
}

export interface ListUserReservationsResponse {
  reservations: UserReservationListItem[];
  limit: number;
  offset: number;
}

/** Statuts backend `ReservationStatus` (Prisma). */
export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELED"
  | "USED"
  | "EXPIRED";

export interface ListUserReservationsQuery {
  status?: ReservationStatus;
  upcoming?: boolean;
  past?: boolean;
  limit?: number;
  offset?: number;
}

/** Codes d'erreur API liés aux réservations pending (OpenAPI `ApiErrorCode`). */
export type ReservationApiErrorCode =
  | "PENDING_ALREADY_EXISTS"
  | "PENDING_ALREADY_CONSUMED"
  | "PENDING_EXPIRED"
  | "PENDING_NOT_FOUND"
  | "TRIP_FULL"
  | "TRIP_DISABLED"
  | "TRIP_PAST"
  | "TRIP_NOT_FOUND"
  | "RESERVATION_NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED_RESERVATION"
  | "NETWORK_ERROR"
  | "UNKNOWN";
