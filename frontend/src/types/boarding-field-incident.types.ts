/** Aligné backend OPS-02B — POST /api/boarding/field-incidents */

export type FieldIncidentBoardingReason =
  | "INVALID_TOKEN"
  | "EXPIRED_TOKEN"
  | "INVALID_TYPE"
  | "INVALID_PAYLOAD"
  | "RESERVATION_NOT_FOUND"
  | "TOKEN_REVOKED"
  | "RESERVATION_NOT_CONFIRMED"
  | "TRIP_DISABLED"
  | "BOARDING_WINDOW_EXPIRED"
  | "PAYMENT_NOT_SUCCEEDED"
  | "INTERNAL_VALIDATION_ERROR"
  | "INTERNAL_CONSUMPTION_ERROR";

export type FieldIncidentType =
  | "BOARDING"
  | "CAPACITY"
  | "PAYMENT"
  | "NO_SHOW"
  | "SAFETY"
  | "DELAY"
  | "TECHNICAL"
  | "BEHAVIOR"
  | "OTHER";

export type FieldIncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface FieldIncidentBoardingContext {
  consumeReason?: FieldIncidentBoardingReason;
  validateReason?: FieldIncidentBoardingReason;
  requestId?: string;
  boardingToken?: string;
}

export interface CreateFieldIncidentBody {
  title?: string;
  description?: string;
  type?: FieldIncidentType;
  severity?: FieldIncidentSeverity;
  relatedTripId: string;
  relatedReservationId?: string;
  boardingContext?: FieldIncidentBoardingContext;
}

export interface FieldIncidentUserRef {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface FieldIncidentResponse {
  id: string;
  code: string;
  title: string;
  description: string | null;
  type: FieldIncidentType;
  status: string;
  severity: FieldIncidentSeverity;
  source: string;
  relatedReservationId: string | null;
  relatedTripId: string | null;
  creator: FieldIncidentUserRef;
}
