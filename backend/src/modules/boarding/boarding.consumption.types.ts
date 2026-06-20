import {
  BOARDING_CONSUMPTION_REASONS,
  type BoardingConsumptionReason,
} from "./boarding-consumption-reasons.js";
import type { BoardingUiMessage } from "./boarding-ui.types.js";
import type { BoardingFailureContext } from "./boarding-context.types.js";

export interface BoardingConsumptionPassengerDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface BoardingConsumptionTripDto {
  id: string;
  departureTime: string;
}

export interface BoardingConsumptionReservationDto {
  id: string;
  status: string;
  usedAt?: string;
}

export interface BoardingConsumptionSuccessResponse {
  valid: true;
  consumed: true;
  ui: BoardingUiMessage;
  reservation: BoardingConsumptionReservationDto;
  trip: BoardingConsumptionTripDto;
  passenger: BoardingConsumptionPassengerDto;
}

export interface BoardingConsumptionAlreadyUsedResponse {
  valid: true;
  consumed: false;
  reason: typeof BOARDING_CONSUMPTION_REASONS.BOARDING_ALREADY_USED;
  ui: BoardingUiMessage;
  reservation?: BoardingConsumptionReservationDto;
  trip?: BoardingConsumptionTripDto;
  passenger?: BoardingConsumptionPassengerDto;
}

export interface BoardingConsumptionFailureResponse {
  valid: false;
  consumed: false;
  reason: BoardingConsumptionReason;
  ui: BoardingUiMessage;
  context?: BoardingFailureContext;
}

export type BoardingConsumptionResponse =
  | BoardingConsumptionSuccessResponse
  | BoardingConsumptionAlreadyUsedResponse
  | BoardingConsumptionFailureResponse;
