import { ReservationStatus, type Prisma } from "@prisma/client";
import { AppError } from "../../lib/errors.js";
import { writeAuditLog } from "../../lib/audit-log.js";
import { prisma } from "../../lib/prisma.js";
import { serializeAdminReservation } from "./admin.serializers.js";
import type { ListAdminReservationsQuery } from "./admin.schemas.js";
import type { ListAdminReservationsResult } from "./admin.types.js";

const reservationInclude = {
  user: true,
  trip: { include: { line: true } },
  payment: true,
} as const;

function buildWhere(query: ListAdminReservationsQuery): Prisma.ReservationWhereInput {
  const where: Prisma.ReservationWhereInput = {};

  if (query.status) {
    where.status = query.status as ReservationStatus;
  }
  if (query.userId) {
    where.userId = query.userId;
  }
  if (query.tripId) {
    where.tripId = query.tripId;
  }

  const tripFilter: Prisma.TripWhereInput = {};
  if (query.lineId) tripFilter.lineId = query.lineId;
  const departureTime: Prisma.DateTimeFilter = {};
  if (query.from) departureTime.gte = new Date(query.from);
  if (query.to) departureTime.lte = new Date(query.to);
  if (query.from || query.to) tripFilter.departureTime = departureTime;
  if (Object.keys(tripFilter).length > 0) {
    where.trip = tripFilter;
  }

  return where;
}

export async function listAdminReservations(
  query: ListAdminReservationsQuery
): Promise<ListAdminReservationsResult> {
  const reservations = await prisma.reservation.findMany({
    where: buildWhere(query),
    include: reservationInclude,
    orderBy: { createdAt: "desc" },
    take: query.limit,
    skip: query.offset,
  });

  return {
    reservations: reservations.map(serializeAdminReservation),
    limit: query.limit,
    offset: query.offset,
  };
}

export async function getAdminReservation(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: reservationInclude,
  });

  if (!reservation) {
    throw new AppError("Reservation not found", 404, "RESERVATION_NOT_FOUND");
  }

  return serializeAdminReservation(reservation);
}

export async function cancelAdminReservation(
  reservationId: string,
  actorUserId: string,
  reason?: string
) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: reservationInclude,
  });

  if (!reservation) {
    throw new AppError("Reservation not found", 404, "RESERVATION_NOT_FOUND");
  }

  if (reservation.status === ReservationStatus.CANCELED) {
    throw new AppError("Reservation is already canceled", 409, "RESERVATION_ALREADY_CANCELED");
  }

  if (reservation.status === ReservationStatus.USED) {
    throw new AppError("Cannot cancel a used reservation", 409, "RESERVATION_ALREADY_USED");
  }

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: ReservationStatus.CANCELED },
    include: reservationInclude,
  });

  await writeAuditLog({
    actorUserId,
    action: "RESERVATION_CANCELLED",
    targetType: "Reservation",
    targetId: reservationId,
    metadata: reason ? { reason } : undefined,
  });

  return serializeAdminReservation(updated);
}
