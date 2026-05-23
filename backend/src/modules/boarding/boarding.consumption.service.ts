import { ReservationStatus } from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { lockReservationForUpdate } from "../reservations/reservation-locking.js";
import { BOARDING_CONSUMPTION_REASONS, type BoardingConsumptionReason } from "./boarding-consumption-reasons.js";
import {
  evaluateConfirmedConsumptionEligibility,
  evaluateUsedBoardingMatch,
  payloadMatchesReservation,
  reservationBoardingInclude,
  type ReservationForBoarding,
} from "./boarding-eligibility.js";
import { verifyBoardingToken } from "./boarding-jwt.js";
import type { BoardingConsumptionResponse } from "./boarding.consumption.types.js";
import {
  getConsumeAlreadyUsedUi,
  getConsumeFailureUi,
  getConsumeSuccessUi,
} from "./boarding-ui-messages.js";
import { BoardingTokenVerificationError } from "./boarding.types.js";
import type { VerifiedBoardingPayload } from "./boarding.types.js";

function mapJwtVerificationReason(
  reason: BoardingTokenVerificationError["reason"]
): BoardingConsumptionReason {
  switch (reason) {
    case "invalid_signature":
      return BOARDING_CONSUMPTION_REASONS.INVALID_TOKEN;
    case "expired":
      return BOARDING_CONSUMPTION_REASONS.EXPIRED_TOKEN;
    case "invalid_type":
      return BOARDING_CONSUMPTION_REASONS.INVALID_TYPE;
    case "invalid_payload":
      return BOARDING_CONSUMPTION_REASONS.INVALID_PAYLOAD;
    default:
      return BOARDING_CONSUMPTION_REASONS.INVALID_TOKEN;
  }
}

async function auditConsumption(input: {
  actorUserId: string;
  action: string;
  reservationId?: string;
  tripId?: string;
  reason?: BoardingConsumptionReason;
  requestId?: string;
}): Promise<void> {
  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: input.action,
    targetType: "Reservation",
    targetId: input.reservationId,
    metadata: {
      tripId: input.tripId,
      reason: input.reason,
      requestId: input.requestId,
    },
  });
}

function failure(
  adminUserId: string,
  reason: BoardingConsumptionReason,
  context: { reservationId?: string; tripId?: string; requestId?: string }
): BoardingConsumptionResponse {
  logger.info("Boarding consumption failed", {
    reason,
    reservationId: context.reservationId,
    tripId: context.tripId,
    requestId: context.requestId,
    adminUserId,
  });

  void auditConsumption({
    actorUserId: adminUserId,
    action: "BOARDING_CONSUMPTION_FAILED",
    reservationId: context.reservationId,
    tripId: context.tripId,
    reason,
    requestId: context.requestId,
  });

  return { valid: false, consumed: false, reason, ui: getConsumeFailureUi(reason) };
}

function toSuccessResponse(
  reservation: {
    id: string;
    status: ReservationStatus;
    usedAt: Date | null;
    user: { id: string; firstName: string | null; lastName: string | null };
    trip: { id: string; departureTime: Date };
  }
): BoardingConsumptionResponse {
  return {
    valid: true,
    consumed: true,
    ui: getConsumeSuccessUi(),
    reservation: {
      id: reservation.id,
      status: reservation.status,
      usedAt: reservation.usedAt?.toISOString(),
    },
    trip: {
      id: reservation.trip.id,
      departureTime: reservation.trip.departureTime.toISOString(),
    },
    passenger: {
      id: reservation.user.id,
      firstName: reservation.user.firstName,
      lastName: reservation.user.lastName,
    },
  };
}

async function handleAlreadyUsed(
  adminUserId: string,
  reservation: ReservationForBoarding,
  requestId: string | undefined
): Promise<BoardingConsumptionResponse> {
  await auditConsumption({
    actorUserId: adminUserId,
    action: "BOARDING_ALREADY_USED",
    reservationId: reservation.id,
    tripId: reservation.trip.id,
    reason: BOARDING_CONSUMPTION_REASONS.BOARDING_ALREADY_USED,
    requestId,
  });

  return {
    valid: true,
    consumed: false,
    reason: BOARDING_CONSUMPTION_REASONS.BOARDING_ALREADY_USED,
    ui: getConsumeAlreadyUsedUi(),
    reservation: {
      id: reservation.id,
      status: reservation.status,
      usedAt: reservation.usedAt?.toISOString(),
    },
    trip: {
      id: reservation.trip.id,
      departureTime: reservation.trip.departureTime.toISOString(),
    },
    passenger: {
      id: reservation.user.id,
      firstName: reservation.user.firstName,
      lastName: reservation.user.lastName,
    },
  };
}

async function consumeInTransaction(
  reservationId: string,
  payload: VerifiedBoardingPayload,
  adminUserId: string,
  now: Date
): Promise<
  | { type: "consumed"; reservation: ReservationForBoarding }
  | { type: "already_used" }
  | { type: "invalid"; reason: BoardingConsumptionReason }
> {
  return prisma.$transaction(async (tx) => {
    const locked = await lockReservationForUpdate(tx, reservationId);
    if (!locked) {
      return { type: "invalid", reason: BOARDING_CONSUMPTION_REASONS.RESERVATION_NOT_FOUND };
    }

    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: reservationBoardingInclude,
    });

    if (!reservation) {
      return { type: "invalid", reason: BOARDING_CONSUMPTION_REASONS.RESERVATION_NOT_FOUND };
    }

    if (reservation.status === ReservationStatus.USED) {
      const usedReason = evaluateUsedBoardingMatch(reservation, payload);
      if (usedReason === null) {
        return { type: "already_used" };
      }
      return { type: "invalid", reason: usedReason };
    }

    const eligibilityReason = evaluateConfirmedConsumptionEligibility(reservation, payload, now);
    if (eligibilityReason !== null) {
      return { type: "invalid", reason: eligibilityReason };
    }

    const updated = (await tx.reservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.USED,
        usedAt: now,
        usedByUserId: adminUserId,
      },
      include: reservationBoardingInclude,
    })) as ReservationForBoarding;

    return { type: "consumed", reservation: updated };
  });
}

export async function consumeBoardingTokenSubmission(
  jwt: string,
  adminUserId: string,
  requestId?: string
): Promise<BoardingConsumptionResponse> {
  const context: { reservationId?: string; tripId?: string; requestId?: string } = {
    requestId,
  };

  try {
    let payload: VerifiedBoardingPayload;
    try {
      payload = verifyBoardingToken(jwt);
    } catch (error) {
      if (error instanceof BoardingTokenVerificationError) {
        return failure(adminUserId, mapJwtVerificationReason(error.reason), context);
      }
      throw error;
    }

    context.reservationId = payload.reservationId;
    context.tripId = payload.tripId;

    const preCheck = await prisma.reservation.findUnique({
      where: { id: payload.reservationId },
      include: reservationBoardingInclude,
    });

    if (!preCheck) {
      return failure(adminUserId, BOARDING_CONSUMPTION_REASONS.RESERVATION_NOT_FOUND, context);
    }

    if (preCheck.status === ReservationStatus.USED) {
      const usedReason = evaluateUsedBoardingMatch(preCheck, payload);
      if (usedReason === null) {
        return handleAlreadyUsed(adminUserId, preCheck, requestId);
      }
      return failure(adminUserId, usedReason, context);
    }

    if (preCheck.status !== ReservationStatus.CONFIRMED) {
      if (!payloadMatchesReservation(preCheck, payload)) {
        return failure(adminUserId, BOARDING_CONSUMPTION_REASONS.TOKEN_REVOKED, context);
      }
      return failure(adminUserId, BOARDING_CONSUMPTION_REASONS.RESERVATION_NOT_CONFIRMED, context);
    }

    const now = new Date();
    const preEligibility = evaluateConfirmedConsumptionEligibility(preCheck, payload, now);
    if (preEligibility !== null) {
      return failure(adminUserId, preEligibility, context);
    }

    const txResult = await consumeInTransaction(
      payload.reservationId,
      payload,
      adminUserId,
      now
    );

    if (txResult.type === "invalid") {
      return failure(adminUserId, txResult.reason, context);
    }

    if (txResult.type === "already_used") {
      const usedReservation = await prisma.reservation.findUnique({
        where: { id: payload.reservationId },
        include: reservationBoardingInclude,
      });
      if (!usedReservation) {
        return failure(adminUserId, BOARDING_CONSUMPTION_REASONS.RESERVATION_NOT_FOUND, context);
      }
      return handleAlreadyUsed(adminUserId, usedReservation, requestId);
    }

    await auditConsumption({
      actorUserId: adminUserId,
      action: "BOARDING_CONSUMED",
      reservationId: txResult.reservation.id,
      tripId: txResult.reservation.trip.id,
      requestId,
    });

    logger.info("Boarding consumed", {
      reservationId: txResult.reservation.id,
      tripId: txResult.reservation.trip.id,
      requestId,
      adminUserId,
    });

    return toSuccessResponse(txResult.reservation);
  } catch (error) {
    logger.error("Boarding consumption internal error", {
      requestId,
      adminUserId,
      reservationId: context.reservationId,
      tripId: context.tripId,
      error: error instanceof Error ? error.message : String(error),
    });

    await auditConsumption({
      actorUserId: adminUserId,
      action: "BOARDING_CONSUMPTION_ERROR",
      reservationId: context.reservationId,
      tripId: context.tripId,
      reason: BOARDING_CONSUMPTION_REASONS.INTERNAL_CONSUMPTION_ERROR,
      requestId,
    });

    return {
      valid: false,
      consumed: false,
      reason: BOARDING_CONSUMPTION_REASONS.INTERNAL_CONSUMPTION_ERROR,
      ui: getConsumeFailureUi(BOARDING_CONSUMPTION_REASONS.INTERNAL_CONSUMPTION_ERROR),
    };
  }
}
