import { ReservationStatus, type Line, type Prisma, type Trip } from "@prisma/client";
import { parisDayBoundsUtc, startOfTodayParisUtc } from "../../lib/paris-time.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import type { ListPublicTripsQuery } from "./public-trips.schemas.js";
import type { PublicTrip, PublicTripsListResult } from "./public-trips.types.js";

const OCCUPIED_STATUSES: ReservationStatus[] = [
  ReservationStatus.CONFIRMED,
  ReservationStatus.USED,
];

type TripWithLine = Trip & { line: Line };

function toPublicLine(line: Line) {
  return {
    id: line.id,
    name: line.name,
    startCity: line.startCity,
    endCity: line.endCity,
  };
}

function buildAvailability(totalSeats: number, reservedSeats: number) {
  const remainingSeats = Math.max(0, totalSeats - reservedSeats);
  return {
    totalSeats,
    reservedSeats,
    remainingSeats,
    isFull: remainingSeats <= 0,
  };
}

function toPublicTrip(trip: TripWithLine, reservedSeats: number): PublicTrip {
  const availability = buildAvailability(trip.totalSeats, reservedSeats);
  return {
    id: trip.id,
    line: toPublicLine(trip.line),
    departureTime: trip.departureTime.toISOString(),
    arrivalTime: trip.arrivalTime?.toISOString() ?? null,
    ...availability,
  };
}

async function getReservedCountsByTripId(tripIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (tripIds.length === 0) return map;

  const groups = await prisma.reservation.groupBy({
    by: ["tripId"],
    where: {
      tripId: { in: tripIds },
      status: { in: OCCUPIED_STATUSES },
    },
    _count: { _all: true },
  });

  for (const group of groups) {
    map.set(group.tripId, group._count._all);
  }

  return map;
}

function buildDepartureTimeFilter(query: ListPublicTripsQuery): Prisma.DateTimeFilter {
  const filter: Prisma.DateTimeFilter = {};

  let min: Date | undefined = startOfTodayParisUtc();
  let max: Date | undefined;

  if (query.date) {
    try {
      const { start, end } = parisDayBoundsUtc(query.date);
      min = start;
      max = end;
    } catch {
      throw new AppError("Invalid date", 400, "VALIDATION_ERROR");
    }
  }

  if (query.from) {
    const fromDate = new Date(query.from);
    min = min ? (fromDate > min ? fromDate : min) : fromDate;
  }

  if (query.to) {
    const toDate = new Date(query.to);
    max = max ? (toDate < max ? toDate : max) : toDate;
  }

  if (min) filter.gte = min;
  if (max) filter.lte = max;

  return filter;
}

export async function listPublicTrips(query: ListPublicTripsQuery): Promise<PublicTripsListResult> {
  const where: Prisma.TripWhereInput = {
    deletedAt: null,
    departureTime: buildDepartureTimeFilter(query),
  };

  if (query.lineId) {
    where.lineId = query.lineId;
  }

  const trips = await prisma.trip.findMany({
    where,
    include: { line: true },
    orderBy: { departureTime: "asc" },
    take: query.limit,
    skip: query.offset,
  });

  const reservedMap = await getReservedCountsByTripId(trips.map((t) => t.id));

  return {
    trips: trips.map((trip) => toPublicTrip(trip, reservedMap.get(trip.id) ?? 0)),
    limit: query.limit,
    offset: query.offset,
  };
}

export async function getPublicTripById(id: string): Promise<PublicTrip> {
  const trip = await prisma.trip.findFirst({
    where: { id, deletedAt: null },
    include: { line: true },
  });

  if (!trip) {
    throw new AppError("Trip not found", 404, "TRIP_NOT_FOUND");
  }

  const reservedMap = await getReservedCountsByTripId([trip.id]);
  return toPublicTrip(trip, reservedMap.get(trip.id) ?? 0);
}
