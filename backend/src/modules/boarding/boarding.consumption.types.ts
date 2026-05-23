import {
  BOARDING_CONSUMPTION_REASONS,
  type BoardingConsumptionReason,
} from "./boarding-consumption-reasons.js";

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
  reservation: BoardingConsumptionReservationDto;
  trip: BoardingConsumptionTripDto;
  passenger: BoardingConsumptionPassengerDto;
}

export interface BoardingConsumptionAlreadyUsedResponse {
  valid: true;
  consumed: false;
  reason: typeof BOARDING_CONSUMPTION_REASONS.BOARDING_ALREADY_USED;
}

export interface BoardingConsumptionFailureResponse {
  valid: false;
  consumed: false;
  reason: BoardingConsumptionReason;
}

export type BoardingConsumptionResponse =
  | BoardingConsumptionSuccessResponse
  | BoardingConsumptionAlreadyUsedResponse
  | BoardingConsumptionFailureResponse;
