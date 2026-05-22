import type { Prisma, Trip } from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateTripInput, ListTripsQuery, UpdateTripInput } from "./trips.schemas.js";
import type { TripWithRelations } from "./transport.types.js";

function assertTripTimes(departureTime: Date, arrivalTime: Date | null | undefined): void {
  if (arrivalTime && arrivalTime <= departureTime) {
    throw new AppError(
      "arrivalTime must be after departureTime",
      400,
      "INVALID_TRIP_TIME"
    );
  }
}

function assertTotalSeats(totalSeats: number): void {
  if (totalSeats < 1 || totalSeats > 8) {
    throw new AppError("totalSeats must be between 1 and 8", 400, "INVALID_TOTAL_SEATS");
  }
}

async function assertLineExists(lineId: string): Promise<void> {
  const line = await prisma.line.findUnique({ where: { id: lineId }, select: { id: true } });
  if (!line) {
    throw new AppError("Line not found", 404, "LINE_NOT_FOUND");
  }
}

async function assertDriverExists(driverId: string | null | undefined): Promise<void> {
  if (!driverId) return;

  const driver = await prisma.user.findUnique({ where: { id: driverId }, select: { id: true } });
  if (!driver) {
    throw new AppError("Driver not found", 404, "DRIVER_NOT_FOUND");
  }
}

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

export async function createTrip(
  input: CreateTripInput,
  actorUserId: string
): Promise<TripWithRelations> {
  await assertLineExists(input.lineId);
  await assertDriverExists(input.driverId ?? null);
  assertTripTimes(input.departureTime, input.arrivalTime);
  assertTotalSeats(input.totalSeats);

  const trip = await prisma.trip.create({
    data: {
      lineId: input.lineId,
      driverId: input.driverId ?? null,
      departureTime: input.departureTime,
      arrivalTime: input.arrivalTime,
      totalSeats: input.totalSeats,
    },
    include: tripInclude,
  });

  await writeAuditLog({
    actorUserId,
    action: "TRIP_CREATED",
    targetType: "Trip",
    targetId: trip.id,
    metadata: { lineId: trip.lineId, departureTime: trip.departureTime.toISOString() },
  });

  return trip;
}

export async function listTrips(query: ListTripsQuery): Promise<TripWithRelations[]> {
  const where: Prisma.TripWhereInput = {};

  if (!query.includeDisabled) {
    where.deletedAt = null;
  }

  if (query.lineId) {
    where.lineId = query.lineId;
  }

  if (query.from || query.to) {
    where.departureTime = {};
    if (query.from) {
      where.departureTime.gte = new Date(query.from);
    }
    if (query.to) {
      where.departureTime.lte = new Date(query.to);
    }
  }

  return prisma.trip.findMany({
    where,
    include: tripInclude,
    orderBy: { departureTime: "asc" },
  });
}

export async function getTripById(id: string): Promise<TripWithRelations> {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: tripInclude,
  });

  if (!trip) {
    throw new AppError("Trip not found", 404, "TRIP_NOT_FOUND");
  }

  return trip;
}

export async function updateTrip(
  id: string,
  input: UpdateTripInput,
  actorUserId: string
): Promise<TripWithRelations> {
  const existing = await getTripById(id);

  if (input.lineId !== undefined) {
    await assertLineExists(input.lineId);
  }

  if (input.driverId !== undefined) {
    await assertDriverExists(input.driverId);
  }

  const departureTime = input.departureTime ?? existing.departureTime;
  const arrivalTime =
    input.arrivalTime !== undefined ? input.arrivalTime : existing.arrivalTime;

  assertTripTimes(departureTime, arrivalTime);

  if (input.totalSeats !== undefined) {
    assertTotalSeats(input.totalSeats);
  }

  const data: Prisma.TripUncheckedUpdateInput = {};
  if (input.lineId !== undefined) data.lineId = input.lineId;
  if (input.driverId !== undefined) data.driverId = input.driverId;
  if (input.departureTime !== undefined) data.departureTime = input.departureTime;
  if (input.arrivalTime !== undefined) data.arrivalTime = input.arrivalTime;
  if (input.totalSeats !== undefined) data.totalSeats = input.totalSeats;

  const trip = await prisma.trip.update({
    where: { id },
    data,
    include: tripInclude,
  });

  await writeAuditLog({
    actorUserId,
    action: "TRIP_UPDATED",
    targetType: "Trip",
    targetId: trip.id,
    metadata: { fields: Object.keys(input) },
  });

  return trip;
}

export async function disableTrip(id: string, actorUserId: string): Promise<Trip> {
  const existing = await getTripById(id);

  const trip = await prisma.trip.update({
    where: { id },
    data: {
      deletedAt: existing.deletedAt ?? new Date(),
    },
  });

  await writeAuditLog({
    actorUserId,
    action: "TRIP_DISABLED",
    targetType: "Trip",
    targetId: trip.id,
  });

  return trip;
}

export async function enableTrip(id: string, actorUserId: string): Promise<Trip> {
  await getTripById(id);

  const trip = await prisma.trip.update({
    where: { id },
    data: { deletedAt: null },
  });

  await writeAuditLog({
    actorUserId,
    action: "TRIP_ENABLED",
    targetType: "Trip",
    targetId: trip.id,
  });

  return trip;
}
