import { PaymentStatus, ReservationStatus } from "@prisma/client";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { generateOpaqueToken } from "../auth/auth.utils.js";
import { BOARDING_GRACE_MS } from "./boarding.constants.js";
import { signBoardingJwt } from "./boarding-jwt.js";
import type { BoardingTokenResponse } from "./boarding.types.js";

function computeBoardingExpiresAt(departureTime: Date): Date {
  return new Date(departureTime.getTime() + BOARDING_GRACE_MS);
}

function assertBoardingWindowOpen(departureTime: Date, now: Date): void {
  const expiresAt = computeBoardingExpiresAt(departureTime);
  if (expiresAt <= now) {
    throw new AppError("Boarding window has expired", 410, "BOARDING_EXPIRED");
  }
}

export async function generateBoardingToken(
  reservationId: string,
  userId: string
): Promise<BoardingTokenResponse> {
  const now = new Date();

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, userId },
    include: {
      trip: { select: { id: true, departureTime: true } },
      payment: { select: { status: true } },
    },
  });

  if (!reservation) {
    throw new AppError("Reservation not found", 404, "RESERVATION_NOT_FOUND");
  }

  if (reservation.status !== ReservationStatus.CONFIRMED) {
    throw new AppError("Reservation is not confirmed", 409, "RESERVATION_NOT_CONFIRMED");
  }

  if (!reservation.payment || reservation.payment.status !== PaymentStatus.SUCCEEDED) {
    throw new AppError("Boarding is not available for this reservation", 409, "BOARDING_NOT_AVAILABLE");
  }

  assertBoardingWindowOpen(reservation.trip.departureTime, now);

  let opaqueToken = reservation.boardingToken;
  if (!opaqueToken) {
    opaqueToken = generateOpaqueToken();
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { boardingToken: opaqueToken },
    });
  }

  const expiresAt = computeBoardingExpiresAt(reservation.trip.departureTime);
  const issuedAtSeconds = Math.floor(now.getTime() / 1000);
  const expiresAtSeconds = Math.floor(expiresAt.getTime() / 1000);

  const boardingToken = signBoardingJwt({
    sub: reservation.id,
    typ: "boarding",
    uid: userId,
    tid: reservation.trip.id,
    bt: opaqueToken,
    iat: issuedAtSeconds,
    exp: expiresAtSeconds,
  });

  logger.info("Boarding token generated", {
    reservationId: reservation.id,
    tripId: reservation.trip.id,
    userId,
  });

  return {
    reservationId: reservation.id,
    tripId: reservation.trip.id,
    boardingToken,
    expiresAt: expiresAt.toISOString(),
  };
}
