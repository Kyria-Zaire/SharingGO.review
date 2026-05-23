import { PaymentStatus, ReservationStatus } from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { BOARDING_GRACE_MS } from "./boarding.constants.js";
import { verifyBoardingToken } from "./boarding-jwt.js";
import {
  BOARDING_VALIDATION_REASONS,
  type BoardingValidationReason,
} from "./boarding-validation-reasons.js";
import type { BoardingValidationResponse } from "./boarding.validation.types.js";
import { BoardingTokenVerificationError } from "./boarding.types.js";

function mapJwtVerificationReason(
  reason: BoardingTokenVerificationError["reason"]
): BoardingValidationReason {
  switch (reason) {
    case "invalid_signature":
      return BOARDING_VALIDATION_REASONS.INVALID_TOKEN;
    case "expired":
      return BOARDING_VALIDATION_REASONS.EXPIRED_TOKEN;
    case "invalid_type":
      return BOARDING_VALIDATION_REASONS.INVALID_TYPE;
    case "invalid_payload":
      return BOARDING_VALIDATION_REASONS.INVALID_PAYLOAD;
    default:
      return BOARDING_VALIDATION_REASONS.INVALID_TOKEN;
  }
}

function isBoardingWindowOpen(departureTime: Date, now: Date): boolean {
  return departureTime.getTime() + BOARDING_GRACE_MS > now.getTime();
}

function auditActionForReason(reason: BoardingValidationReason): string {
  switch (reason) {
    case BOARDING_VALIDATION_REASONS.TOKEN_REVOKED:
      return "BOARDING_TOKEN_REVOKED";
    case BOARDING_VALIDATION_REASONS.EXPIRED_TOKEN:
    case BOARDING_VALIDATION_REASONS.BOARDING_WINDOW_EXPIRED:
      return "BOARDING_TOKEN_EXPIRED";
    case BOARDING_VALIDATION_REASONS.INTERNAL_VALIDATION_ERROR:
      return "BOARDING_INTERNAL_VALIDATION_ERROR";
    default:
      return "BOARDING_VALIDATION_FAILED";
  }
}

async function auditBoardingValidation(input: {
  actorUserId: string;
  success: boolean;
  reservationId?: string;
  tripId?: string;
  reason?: BoardingValidationReason;
  requestId?: string;
}): Promise<void> {
  const action = input.success
    ? "BOARDING_VALIDATION_SUCCESS"
    : auditActionForReason(input.reason ?? BOARDING_VALIDATION_REASONS.INVALID_TOKEN);

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action,
    targetType: "Reservation",
    targetId: input.reservationId,
    metadata: {
      tripId: input.tripId,
      reason: input.reason,
      requestId: input.requestId,
    },
  });
}

async function fail(
  adminUserId: string,
  reason: BoardingValidationReason,
  context: { reservationId?: string; tripId?: string; requestId?: string }
): Promise<BoardingValidationResponse> {
  logger.info("Boarding validation failed", {
    reason,
    reservationId: context.reservationId,
    tripId: context.tripId,
    requestId: context.requestId,
    adminUserId,
  });

  await auditBoardingValidation({
    actorUserId: adminUserId,
    success: false,
    reason,
    reservationId: context.reservationId,
    tripId: context.tripId,
    requestId: context.requestId,
  });

  return { valid: false, reason };
}

export async function validateBoardingTokenSubmission(
  jwt: string,
  adminUserId: string,
  requestId?: string
): Promise<BoardingValidationResponse> {
  const context: { reservationId?: string; tripId?: string; requestId?: string } = {
    requestId,
  };

  try {
    let payload;
    try {
      payload = verifyBoardingToken(jwt);
    } catch (error) {
      if (error instanceof BoardingTokenVerificationError) {
        const reason = mapJwtVerificationReason(error.reason);
        return fail(adminUserId, reason, context);
      }
      throw error;
    }

    context.reservationId = payload.reservationId;
    context.tripId = payload.tripId;

    const reservation = await prisma.reservation.findUnique({
      where: { id: payload.reservationId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        trip: { include: { line: true } },
        payment: { select: { status: true } },
      },
    });

    if (!reservation) {
      return fail(adminUserId, BOARDING_VALIDATION_REASONS.RESERVATION_NOT_FOUND, context);
    }

    if (reservation.userId !== payload.userId || reservation.tripId !== payload.tripId) {
      return fail(adminUserId, BOARDING_VALIDATION_REASONS.TOKEN_REVOKED, context);
    }

    if (!reservation.boardingToken || reservation.boardingToken !== payload.opaqueBoardingToken) {
      return fail(adminUserId, BOARDING_VALIDATION_REASONS.TOKEN_REVOKED, context);
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      return fail(adminUserId, BOARDING_VALIDATION_REASONS.RESERVATION_NOT_CONFIRMED, context);
    }

    if (reservation.trip.deletedAt !== null) {
      return fail(adminUserId, BOARDING_VALIDATION_REASONS.TRIP_DISABLED, context);
    }

    const now = new Date();
    if (!isBoardingWindowOpen(reservation.trip.departureTime, now)) {
      return fail(adminUserId, BOARDING_VALIDATION_REASONS.BOARDING_WINDOW_EXPIRED, context);
    }

    if (!reservation.payment || reservation.payment.status !== PaymentStatus.SUCCEEDED) {
      return fail(adminUserId, BOARDING_VALIDATION_REASONS.PAYMENT_NOT_SUCCEEDED, context);
    }

    await auditBoardingValidation({
      actorUserId: adminUserId,
      success: true,
      reservationId: reservation.id,
      tripId: reservation.trip.id,
      requestId,
    });

    logger.info("Boarding validation succeeded", {
      reservationId: reservation.id,
      tripId: reservation.trip.id,
      requestId,
      adminUserId,
    });

    return {
      valid: true,
      reservation: {
        id: reservation.id,
        status: reservation.status,
      },
      trip: {
        id: reservation.trip.id,
        departureTime: reservation.trip.departureTime.toISOString(),
        line: {
          id: reservation.trip.line.id,
          name: reservation.trip.line.name,
          startCity: reservation.trip.line.startCity,
          endCity: reservation.trip.line.endCity,
        },
      },
      passenger: {
        id: reservation.user.id,
        firstName: reservation.user.firstName,
        lastName: reservation.user.lastName,
      },
    };
  } catch (error) {
    logger.error("Boarding validation internal error", {
      requestId,
      adminUserId,
      reservationId: context.reservationId,
      tripId: context.tripId,
      error: error instanceof Error ? error.message : String(error),
    });

    await auditBoardingValidation({
      actorUserId: adminUserId,
      success: false,
      reason: BOARDING_VALIDATION_REASONS.INTERNAL_VALIDATION_ERROR,
      reservationId: context.reservationId,
      tripId: context.tripId,
      requestId,
    });

    return {
      valid: false,
      reason: BOARDING_VALIDATION_REASONS.INTERNAL_VALIDATION_ERROR,
    };
  }
}
