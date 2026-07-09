import {
  PaymentStatus,
  RefundStatus,
  ReservationStatus,
  TripLifecycleStatus,
  type Prisma,
} from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { writeCascadeAuditLog } from "../../lib/cascade-audit-log.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import type { TripWithRelations } from "../transport/transport.types.js";
import {
  ALLOWED_LIFECYCLE_TRANSITIONS,
  RESERVATION_CANCELLED_BY_TRIP,
  TRIP_LIFECYCLE_AUDIT_ACTIONS,
} from "./trip-lifecycle.constants.js";
import type { CancelTripInput } from "./trip-lifecycle.schemas.js";

const tripInclude = {
  line: true,
  driver: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      userType: true,
    },
  },
} satisfies Prisma.TripInclude;

async function getTripOrThrow(tripId: string): Promise<TripWithRelations> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: tripInclude,
  });
  if (!trip) {
    throw new AppError("Trip not found", 404, "TRIP_NOT_FOUND");
  }
  return trip;
}

function assertTripActive(trip: TripWithRelations): void {
  if (trip.deletedAt !== null) {
    throw new AppError("Trip is not available", 400, "TRIP_DISABLED");
  }
}

function assertTransitionAllowed(
  current: TripLifecycleStatus,
  next: TripLifecycleStatus
): void {
  const allowed = ALLOWED_LIFECYCLE_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new AppError(
      `Transition ${current} → ${next} is not allowed`,
      409,
      "INVALID_LIFECYCLE_TRANSITION"
    );
  }
}

async function applyLifecycleUpdate(
  tripId: string,
  actorUserId: string,
  patch: Omit<Prisma.TripUncheckedUpdateInput, "lifecycleUpdatedByUserId">,
  audit: { action: string; metadata?: Prisma.InputJsonValue }
): Promise<TripWithRelations> {
  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: {
      ...patch,
      lifecycleUpdatedByUserId: actorUserId,
    },
    include: tripInclude,
  });

  await writeAuditLog({
    actorUserId,
    action: audit.action,
    targetType: "Trip",
    targetId: tripId,
    metadata: audit.metadata,
  });

  return trip;
}

export async function startBoarding(
  tripId: string,
  actorUserId: string
): Promise<TripWithRelations> {
  const trip = await getTripOrThrow(tripId);
  assertTripActive(trip);
  assertTransitionAllowed(trip.lifecycleStatus, TripLifecycleStatus.BOARDING);

  const now = new Date();
  return applyLifecycleUpdate(
    tripId,
    actorUserId,
    {
      lifecycleStatus: TripLifecycleStatus.BOARDING,
      boardingStartedAt: now,
    },
    {
      action: TRIP_LIFECYCLE_AUDIT_ACTIONS.BOARDING_STARTED,
      metadata: {
        previousStatus: trip.lifecycleStatus,
        boardingStartedAt: now.toISOString(),
      },
    }
  );
}

export async function markDeparted(
  tripId: string,
  actorUserId: string
): Promise<TripWithRelations> {
  const trip = await getTripOrThrow(tripId);
  assertTripActive(trip);
  assertTransitionAllowed(trip.lifecycleStatus, TripLifecycleStatus.DEPARTED);

  const now = new Date();
  return applyLifecycleUpdate(
    tripId,
    actorUserId,
    {
      lifecycleStatus: TripLifecycleStatus.DEPARTED,
      departedAt: now,
    },
    {
      action: TRIP_LIFECYCLE_AUDIT_ACTIONS.DEPARTED,
      metadata: {
        previousStatus: trip.lifecycleStatus,
        departedAt: now.toISOString(),
      },
    }
  );
}

export async function markCompleted(
  tripId: string,
  actorUserId: string
): Promise<TripWithRelations> {
  const trip = await getTripOrThrow(tripId);
  assertTripActive(trip);
  assertTransitionAllowed(trip.lifecycleStatus, TripLifecycleStatus.COMPLETED);

  const now = new Date();
  return applyLifecycleUpdate(
    tripId,
    actorUserId,
    {
      lifecycleStatus: TripLifecycleStatus.COMPLETED,
      completedAt: now,
    },
    {
      action: TRIP_LIFECYCLE_AUDIT_ACTIONS.COMPLETED,
      metadata: {
        previousStatus: trip.lifecycleStatus,
        completedAt: now.toISOString(),
      },
    }
  );
}

export async function cancelTrip(
  tripId: string,
  input: CancelTripInput,
  actorUserId: string
): Promise<TripWithRelations> {
  const trip = await getTripOrThrow(tripId);
  assertTripActive(trip);
  assertTransitionAllowed(trip.lifecycleStatus, TripLifecycleStatus.CANCELLED);

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.trip.update({
      where: { id: tripId },
      data: {
        lifecycleStatus: TripLifecycleStatus.CANCELLED,
        cancelledAt: now,
        cancellationReason: input.reason,
        lifecycleUpdatedByUserId: actorUserId,
      },
    });

    const reservations = await tx.reservation.findMany({
      where: {
        tripId,
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
      },
      include: { payment: true },
    });

    for (const reservation of reservations) {
      const hasCapturedPayment =
        reservation.payment?.status === PaymentStatus.SUCCEEDED &&
        reservation.payment.stripePaymentIntentId != null;

      await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status: ReservationStatus.CANCELED,
          refundStatus: hasCapturedPayment ? RefundStatus.PENDING : RefundStatus.NONE,
        },
      });

      await writeCascadeAuditLog(tx, {
        actorUserId,
        action: RESERVATION_CANCELLED_BY_TRIP,
        targetType: "Reservation",
        targetId: reservation.id,
        metadata: {
          tripId,
          refundStatus: hasCapturedPayment ? "PENDING" : "NONE",
          hadPayment: hasCapturedPayment,
        },
      });
    }

    await writeCascadeAuditLog(tx, {
      actorUserId,
      action: TRIP_LIFECYCLE_AUDIT_ACTIONS.CANCELLED,
      targetType: "Trip",
      targetId: tripId,
      metadata: {
        previousStatus: trip.lifecycleStatus,
        cancelledAt: now.toISOString(),
        reason: input.reason,
        impactedReservations: reservations.length,
      },
    });
  });

  return getTripOrThrow(tripId);
}
