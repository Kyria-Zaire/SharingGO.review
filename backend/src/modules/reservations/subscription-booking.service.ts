import {
  PaymentStatus,
  PaymentType,
  Prisma,
  ReservationStatus,
  SubscriptionStatus,
} from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { AppError } from "../../lib/errors.js";
import {
  computeRemainingSeats,
  countOccupiedSeats,
  deleteExpiredPendingForTrip,
} from "../../lib/trip-occupancy.js";
import { prisma } from "../../lib/prisma.js";
import { hasActiveSubscription } from "../subscriptions/subscriptions.service.js";
import { lockTripForUpdate } from "./reservation-locking.js";
import type { BookWithSubscriptionResult } from "./reservations.types.js";

const SUBSCRIPTION_ACCESS_AMOUNT = new Prisma.Decimal("0.00");

function assertTripBookable(trip: { deletedAt: Date | null; departureTime: Date }, now: Date): void {
  if (trip.deletedAt != null) {
    throw new AppError("Trip is not available", 400, "TRIP_DISABLED");
  }
  if (trip.departureTime <= now) {
    throw new AppError("Trip has already departed", 400, "TRIP_PAST");
  }
}

async function auditSubscriptionBooking(
  action: string,
  actorUserId: string,
  targetId: string,
  metadata?: Prisma.InputJsonValue
): Promise<void> {
  await writeAuditLog({
    actorUserId,
    action,
    targetType: "Reservation",
    targetId,
    metadata,
  });
}

export async function bookWithSubscription(
  userId: string,
  tripId: string
): Promise<BookWithSubscriptionResult> {
  if (!(await hasActiveSubscription(userId))) {
    await auditSubscriptionBooking(
      "SUBSCRIPTION_BOOKING_REJECTED_NO_ACTIVE_SUBSCRIPTION",
      userId,
      tripId,
      { tripId }
    );
    throw new AppError("Active subscription required", 403, "SUBSCRIPTION_REQUIRED");
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const trip = await lockTripForUpdate(tx, tripId);
    if (!trip) {
      throw new AppError("Trip not found", 404, "TRIP_NOT_FOUND");
    }

    assertTripBookable(trip, now);

    const activeSubscription = await tx.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!activeSubscription) {
      return { rejected: "no_subscription" as const, tripId };
    }

    await deleteExpiredPendingForTrip(tx, tripId, now);

    const activePending = await tx.pendingReservation.findFirst({
      where: {
        tripId,
        userId,
        expiresAt: { gt: now },
        consumedAt: null,
      },
    });

    if (activePending) {
      return { rejected: "pending_exists" as const, tripId, pendingId: activePending.id };
    }

    const existingReservation = await tx.reservation.findFirst({
      where: {
        tripId,
        userId,
        status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.USED] },
      },
    });

    if (existingReservation) {
      return {
        rejected: "duplicate" as const,
        tripId,
        reservationId: existingReservation.id,
      };
    }

    const occupiedBefore = await countOccupiedSeats(tx, tripId, now);
    if (occupiedBefore >= trip.totalSeats) {
      return { rejected: "full" as const, tripId, totalSeats: trip.totalSeats };
    }

    const reservation = await tx.reservation.create({
      data: {
        tripId,
        userId,
        status: ReservationStatus.CONFIRMED,
        boardingToken: null,
      },
    });

    const payment = await tx.payment.create({
      data: {
        userId,
        reservationId: reservation.id,
        amount: SUBSCRIPTION_ACCESS_AMOUNT,
        currency: "eur",
        status: PaymentStatus.SUCCEEDED,
        type: PaymentType.SUBSCRIPTION_ACCESS,
      },
    });

    const occupiedAfter = occupiedBefore + 1;
    const remainingSeats = computeRemainingSeats(trip.totalSeats, occupiedAfter);

    return {
      rejected: false as const,
      reservation,
      payment,
      remainingSeats,
      tripId,
      subscriptionId: activeSubscription.id,
    };
  });

  if (result.rejected === "no_subscription") {
    await auditSubscriptionBooking(
      "SUBSCRIPTION_BOOKING_REJECTED_NO_ACTIVE_SUBSCRIPTION",
      userId,
      tripId,
      { tripId }
    );
    throw new AppError("Active subscription required", 403, "SUBSCRIPTION_REQUIRED");
  }

  if (result.rejected === "pending_exists") {
    throw new AppError(
      "You already have an active pending reservation for this trip",
      409,
      "PENDING_ALREADY_EXISTS"
    );
  }

  if (result.rejected === "duplicate") {
    await auditSubscriptionBooking("SUBSCRIPTION_BOOKING_REJECTED_DUPLICATE", userId, tripId, {
      tripId,
      reservationId: result.reservationId,
    });
    throw new AppError("Reservation already exists for this trip", 409, "RESERVATION_ALREADY_EXISTS");
  }

  if (result.rejected === "full") {
    await auditSubscriptionBooking("SUBSCRIPTION_BOOKING_REJECTED_FULL", userId, tripId, {
      tripId,
      totalSeats: result.totalSeats,
    });
    throw new AppError("Trip is full", 409, "TRIP_FULL");
  }

  await auditSubscriptionBooking("SUBSCRIPTION_BOOKING_CONFIRMED", userId, result.reservation.id, {
    tripId: result.tripId,
    subscriptionId: result.subscriptionId,
    remainingSeats: result.remainingSeats,
  });

  await writeAuditLog({
    actorUserId: userId,
    action: "SUBSCRIPTION_ACCESS_PAYMENT_CREATED",
    targetType: "Payment",
    targetId: result.payment.id,
    metadata: {
      reservationId: result.reservation.id,
      tripId: result.tripId,
    },
  });

  return {
    reservation: {
      id: result.reservation.id,
      status: result.reservation.status,
    },
    payment: {
      id: result.payment.id,
      type: result.payment.type,
      status: result.payment.status,
      amount: result.payment.amount.toFixed(2),
      currency: result.payment.currency,
    },
    remainingSeats: result.remainingSeats,
  };
}
