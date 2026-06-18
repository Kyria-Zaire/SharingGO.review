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
