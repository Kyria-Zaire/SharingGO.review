export type BoardingUiStatus = "success" | "warning" | "error";

export interface BoardingUiMessage {
  status: BoardingUiStatus;
  title: string;
  message: string;
}

export type BoardingValidationReason =
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
  | "INTERNAL_VALIDATION_ERROR";

export type BoardingConsumptionReason =
  | BoardingValidationReason
  | "BOARDING_ALREADY_USED"
  | "INTERNAL_CONSUMPTION_ERROR";

export interface BoardingPassenger {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface BoardingTrip {
  id: string;
  departureTime: string;
  line?: {
    id: string;
    name: string;
    startCity: string;
    endCity: string;
  };
}

export interface BoardingReservation {
  id: string;
  status: string;
  usedAt?: string | null;
}

export interface BoardingValidationSuccess {
  valid: true;
  reservation: BoardingReservation;
  trip: BoardingTrip;
  passenger: BoardingPassenger;
}

export interface BoardingValidationFailure {
  valid: false;
  reason: BoardingValidationReason;
}

export type BoardingValidationResponse = BoardingValidationSuccess | BoardingValidationFailure;

export interface BoardingConsumptionSuccess {
  valid: true;
  consumed: true;
  ui: BoardingUiMessage;
  reservation: BoardingReservation;
  trip: BoardingTrip;
  passenger: BoardingPassenger;
}

export interface BoardingConsumptionAlreadyUsed {
  valid: true;
  consumed: false;
  reason: "BOARDING_ALREADY_USED";
  ui: BoardingUiMessage;
  reservation?: BoardingReservation;
  trip?: BoardingTrip;
  passenger?: BoardingPassenger;
}

export interface BoardingConsumptionFailure {
  valid: false;
  consumed: false;
  reason: BoardingConsumptionReason;
  ui: BoardingUiMessage;
}

export type BoardingConsumeResponse =
  | BoardingConsumptionSuccess
  | BoardingConsumptionAlreadyUsed
  | BoardingConsumptionFailure;

export interface BoardingOfflineValidationCapabilities {
  supported: false;
  reason: "ASYMMETRIC_SIGNATURE_NOT_ENABLED";
  currentAlgorithm: "HS256";
  targetAlgorithms: ("RS256" | "EdDSA")[];
  canDecodePayloadOffline: boolean;
  canVerifySignatureOffline: boolean;
  canCheckRevocationOffline: boolean;
  canPreventDoubleScanOffline: boolean;
}

export interface BoardingServerValidationCapabilities {
  validateEndpoint: string;
  consumeEndpoint: string;
  recommendedMode: "ONLINE_FIRST";
}

export interface OfflineCapabilitiesResponse {
  offlineValidation: BoardingOfflineValidationCapabilities;
  serverValidation: BoardingServerValidationCapabilities;
}

export interface BoardingScanHistoryEntry {
  id: string;
  at: string;
  action: "validate" | "consume";
  uiStatus: BoardingUiStatus;
  title: string;
  reason?: string;
  reservationId?: string;
}

export const BOARDING_SCAN_HISTORY_MAX = 20;
