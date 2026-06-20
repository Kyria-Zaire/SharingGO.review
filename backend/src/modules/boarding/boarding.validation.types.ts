import type { BoardingValidationReason } from "./boarding-validation-reasons.js";
import type { BoardingFailureContext } from "./boarding-context.types.js";

export interface BoardingValidationPassengerDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface BoardingValidationLineDto {
  id: string;
  name: string;
  startCity: string;
  endCity: string;
}

export interface BoardingValidationTripDto {
  id: string;
  departureTime: string;
  line: BoardingValidationLineDto;
}

export interface BoardingValidationReservationDto {
  id: string;
  status: string;
}

export interface BoardingValidationSuccessResponse {
  valid: true;
  reservation: BoardingValidationReservationDto;
  trip: BoardingValidationTripDto;
  passenger: BoardingValidationPassengerDto;
}

export interface BoardingValidationFailureResponse {
  valid: false;
  reason: BoardingValidationReason;
  context?: BoardingFailureContext;
}

export type BoardingValidationResponse =
  | BoardingValidationSuccessResponse
  | BoardingValidationFailureResponse;
