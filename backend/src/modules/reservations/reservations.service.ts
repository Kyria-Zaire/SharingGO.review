import type { PendingReservation, Prisma, ReservationStatus } from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import {
  computeRemainingSeats,
  countOccupiedSeats,
  deleteExpiredPendingForTrip,
} from "../../lib/trip-occupancy.js";
import { prisma } from "../../lib/prisma.js";
import { lockTripForUpdate } from "./reservation-locking.js";
import type { ListReservationsQuery } from "./reservations.schemas.js";
import {
  serializeReservationDetail,
  serializeReservationListItem,
} from "./reservations.serializers.js";
import type {
  CreatePendingReservationResult,
  ListReservationsResult,
  PendingReservationDetail,
} from "./reservations.types.js";
import type { SafeReservationDetailDto } from "./reservations.serializers.js";

const reservationInclude = {
  trip: { include: { line: true } },
  payment: true,
} as const;

const PENDING_TTL_MS = 2 * 60 * 1000;

function addPendingTtl(now: Date): Date {
  return new Date(now.getTime() + PENDING_TTL_MS);
}

async function auditReservation(
  action: string,
  actorUserId: string,
  targetId: string,
  metadata?: Prisma.InputJsonValue
): Promise<void> {
  await writeAuditLog({
    actorUserId,
    action,
    targetType: "PendingReservation",
    targetId,
    metadata,
  });
}

function assertTripBookable(trip: { deletedAt: Date | null; departureTime: Date }, now: Date): void {
  if (trip.deletedAt) {
    throw new AppError("Trip is not available", 400, "TRIP_DISABLED");
  }
  if (trip.departureTime <= now) {
    throw new AppError("Trip has already departed", 400, "TRIP_PAST");
  }
}

function toPendingDetail(
  pending: PendingReservation & { trip: { id: string; departureTime: Date } },
  now: Date
): PendingReservationDetail {
  const isExpired = pending.expiresAt <= now || pending.consumedAt !== null;
  return {
    id: pending.id,
    trip: {
      id: pending.trip.id,
      departureTime: pending.trip.departureTime.toISOString(),
    },
    expiresAt: pending.expiresAt.toISOString(),
    isExpired,
  };
}

export async function createPendingReservation(
  userId: string,
  tripId: string
): Promise<CreatePendingReservationResult> {
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const trip = await lockTripForUpdate(tx, tripId);
    if (!trip) {
      throw new AppError("Trip not found", 404, "TRIP_NOT_FOUND");
    }

    assertTripBookable(trip, now);

    const expiredRemoved = await deleteExpiredPendingForTrip(tx, tripId, now);
    if (expiredRemoved > 0) {
      logger.info("Expired pending reservations removed", { tripId, count: expiredRemoved });
    }

    const existingPending = await tx.pendingReservation.findFirst({
      where: {
        tripId,
        userId,
        expiresAt: { gt: now },
        consumedAt: null,
      },
    });

    if (existingPending) {
      throw new AppError(
        "You already have an active pending reservation for this trip",
        409,
        "PENDING_ALREADY_EXISTS"
      );
    }

    const occupiedBefore = await countOccupiedSeats(tx, tripId, now);
    if (occupiedBefore >= trip.totalSeats) {
      return { rejected: true as const, tripId, totalSeats: trip.totalSeats };
    }

    const expiresAt = addPendingTtl(now);
    const pending = await tx.pendingReservation.create({
      data: {
        tripId,
        userId,
        expiresAt,
      },
    });

    const occupiedAfter = occupiedBefore + 1;
    const remainingSeats = computeRemainingSeats(trip.totalSeats, occupiedAfter);

    return {
      rejected: false as const,
      pending,
      expiresAt,
      remainingSeats,
      tripId,
    };
  });

  if (result.rejected) {
    await auditReservation("PENDING_RESERVATION_REJECTED_FULL", userId, result.tripId, {
      tripId: result.tripId,
    });
    throw new AppError("Trip is full", 409, "TRIP_FULL");
  }

  await auditReservation("PENDING_RESERVATION_CREATED", userId, result.pending.id, {
    tripId: result.tripId,
    expiresAt: result.expiresAt.toISOString(),
  });

  return {
    pendingReservationId: result.pending.id,
    expiresAt: result.expiresAt.toISOString(),
    remainingSeats: result.remainingSeats,
  };
}

export async function getPendingReservation(
  userId: string,
  pendingId: string
): Promise<PendingReservationDetail> {
  const now = new Date();

  const pending = await prisma.pendingReservation.findUnique({
    where: { id: pendingId },
    include: {
      trip: { select: { id: true, departureTime: true } },
    },
  });

  if (!pending) {
    throw new AppError("Pending reservation not found", 404, "PENDING_NOT_FOUND");
  }

  if (pending.userId !== userId) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  if (pending.expiresAt <= now && pending.consumedAt === null) {
    await deleteExpiredPendingForTrip(prisma, pending.tripId, now);
    await auditReservation("PENDING_RESERVATION_EXPIRED", userId, pending.id, {
      tripId: pending.tripId,
    });
    throw new AppError("Pending reservation has expired", 410, "PENDING_EXPIRED");
  }

  if (pending.consumedAt !== null) {
    throw new AppError("Pending reservation not found", 404, "PENDING_NOT_FOUND");
  }

  return toPendingDetail(pending, now);
}

export async function cancelPendingReservation(
  userId: string,
  pendingId: string
): Promise<void> {
  const pending = await prisma.pendingReservation.findUnique({
    where: { id: pendingId },
    select: { id: true, userId: true, tripId: true },
  });

  if (!pending) {
    return;
  }

  if (pending.userId !== userId) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  await prisma.pendingReservation.deleteMany({
    where: { id: pendingId, userId },
  });

  await auditReservation("PENDING_RESERVATION_CANCELED", userId, pending.id, {
    tripId: pending.tripId,
  });
}

function buildReservationListWhere(
  userId: string,
  query: ListReservationsQuery,
  now: Date
): Prisma.ReservationWhereInput {
  const where: Prisma.ReservationWhereInput = { userId };

  if (query.status) {
    where.status = query.status as ReservationStatus;
  }

  if (query.upcoming === true) {
    where.trip = { departureTime: { gte: now } };
  } else if (query.past === true) {
    where.trip = { departureTime: { lt: now } };
  }

  return where;
}

function reservationListOrderBy(
  query: ListReservationsQuery
): Prisma.ReservationOrderByWithRelationInput[] {
  if (query.upcoming === true) {
    return [{ trip: { departureTime: "asc" } }];
  }
  return [{ trip: { departureTime: "desc" } }];
}

export async function listUserReservations(
  userId: string,
  query: ListReservationsQuery
): Promise<ListReservationsResult> {
  const now = new Date();
  const reservations = await prisma.reservation.findMany({
    where: buildReservationListWhere(userId, query, now),
    include: reservationInclude,
    orderBy: reservationListOrderBy(query),
    take: query.limit,
    skip: query.offset,
  });

  return {
    reservations: reservations.map(serializeReservationListItem),
    limit: query.limit,
    offset: query.offset,
  };
}

export async function getUserReservation(
  userId: string,
  reservationId: string
): Promise<SafeReservationDetailDto> {
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, userId },
    include: reservationInclude,
  });

  if (!reservation) {
    throw new AppError("Reservation not found", 404, "RESERVATION_NOT_FOUND");
  }

  return serializeReservationDetail(reservation);
}
