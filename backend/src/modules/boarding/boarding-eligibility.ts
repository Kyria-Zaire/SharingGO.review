import { PaymentStatus, ReservationStatus, TripLifecycleStatus, type Prisma } from "@prisma/client";
import { BOARDING_VALIDATION_REASONS, type BoardingValidationReason } from "./boarding-validation-reasons.js";
import type { VerifiedBoardingPayload } from "./boarding.types.js";

export const reservationBoardingInclude = {
  user: { select: { id: true, firstName: true, lastName: true } },
  trip: { include: { line: true } },
  payment: { select: { status: true } },
} as const;

export type ReservationForBoarding = Prisma.ReservationGetPayload<{
  include: typeof reservationBoardingInclude;
}>;

export function evaluateTripLifecycleBoarding(
  lifecycleStatus: TripLifecycleStatus
): BoardingValidationReason | null {
  switch (lifecycleStatus) {
    case TripLifecycleStatus.WAITING:
      return BOARDING_VALIDATION_REASONS.BOARDING_NOT_STARTED;
    case TripLifecycleStatus.BOARDING:
      return null;
    case TripLifecycleStatus.DEPARTED:
      return BOARDING_VALIDATION_REASONS.BOARDING_CLOSED;
    case TripLifecycleStatus.COMPLETED:
      return BOARDING_VALIDATION_REASONS.TRIP_COMPLETED;
    case TripLifecycleStatus.CANCELLED:
      return BOARDING_VALIDATION_REASONS.TRIP_CANCELLED;
    default:
      return BOARDING_VALIDATION_REASONS.BOARDING_NOT_STARTED;
  }
}

export function payloadMatchesReservation(
  reservation: Pick<ReservationForBoarding, "id" | "userId" | "tripId" | "boardingToken">,
  payload: VerifiedBoardingPayload
): boolean {
  return (
    reservation.id === payload.reservationId &&
    reservation.userId === payload.userId &&
    reservation.tripId === payload.tripId &&
    reservation.boardingToken !== null &&
    reservation.boardingToken === payload.opaqueBoardingToken
  );
}

/** Checks token binding + trip active (for USED idempotency path). */
export function evaluateUsedBoardingMatch(
  reservation: ReservationForBoarding,
  payload: VerifiedBoardingPayload
): BoardingValidationReason | null {
  if (!payloadMatchesReservation(reservation, payload)) {
    return BOARDING_VALIDATION_REASONS.TOKEN_REVOKED;
  }
  if (reservation.trip.deletedAt !== null) {
    return BOARDING_VALIDATION_REASONS.TRIP_DISABLED;
  }
  const lifecycleReason = evaluateTripLifecycleBoarding(reservation.trip.lifecycleStatus);
  if (lifecycleReason !== null) {
    return lifecycleReason;
  }
  return null;
}

/** Full pre-consumption checks when status is CONFIRMED. */
export function evaluateConfirmedConsumptionEligibility(
  reservation: ReservationForBoarding,
  payload: VerifiedBoardingPayload,
  _now: Date
): BoardingValidationReason | null {
  if (!payloadMatchesReservation(reservation, payload)) {
    return BOARDING_VALIDATION_REASONS.TOKEN_REVOKED;
  }
  if (reservation.status !== ReservationStatus.CONFIRMED) {
    return BOARDING_VALIDATION_REASONS.RESERVATION_NOT_CONFIRMED;
  }
  if (reservation.trip.deletedAt !== null) {
    return BOARDING_VALIDATION_REASONS.TRIP_DISABLED;
  }
  const lifecycleReason = evaluateTripLifecycleBoarding(reservation.trip.lifecycleStatus);
  if (lifecycleReason !== null) {
    return lifecycleReason;
  }
  if (!reservation.payment || reservation.payment.status !== PaymentStatus.SUCCEEDED) {
    return BOARDING_VALIDATION_REASONS.PAYMENT_NOT_SUCCEEDED;
  }
  return null;
}
