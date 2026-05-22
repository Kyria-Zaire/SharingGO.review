import { ReservationStatus, type Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";

const OCCUPIED_RESERVATION_STATUSES: ReservationStatus[] = [
  ReservationStatus.CONFIRMED,
  ReservationStatus.USED,
];

type DbClient = Prisma.TransactionClient | typeof prisma;

function activePendingWhere(tripId: string, now: Date): Prisma.PendingReservationWhereInput {
  return {
    tripId,
    expiresAt: { gt: now },
    consumedAt: null,
  };
}

/** Removes expired pending rows for a trip (call inside transactions before counting). */
export async function deleteExpiredPendingForTrip(
  client: DbClient,
  tripId: string,
  now: Date = new Date()
): Promise<number> {
  const result = await client.pendingReservation.deleteMany({
    where: {
      tripId,
      expiresAt: { lt: now },
    },
  });
  return result.count;
}

/** Occupied seats = CONFIRMED/USED reservations + active (non-expired) pending. */
export async function countOccupiedSeats(
  client: DbClient,
  tripId: string,
  now: Date = new Date()
): Promise<number> {
  const [reservationCount, pendingCount] = await Promise.all([
    client.reservation.count({
      where: {
        tripId,
        status: { in: OCCUPIED_RESERVATION_STATUSES },
      },
    }),
    client.pendingReservation.count({
      where: activePendingWhere(tripId, now),
    }),
  ]);

  return reservationCount + pendingCount;
}

/** Batch occupied counts for public trip listings (no row locks). */
export async function getOccupiedCountsByTripIds(
  tripIds: string[],
  now: Date = new Date()
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (tripIds.length === 0) return map;

  const [reservationGroups, pendingGroups] = await Promise.all([
    prisma.reservation.groupBy({
      by: ["tripId"],
      where: {
        tripId: { in: tripIds },
        status: { in: OCCUPIED_RESERVATION_STATUSES },
      },
      _count: { _all: true },
    }),
    prisma.pendingReservation.groupBy({
      by: ["tripId"],
      where: {
        tripId: { in: tripIds },
        expiresAt: { gt: now },
        consumedAt: null,
      },
      _count: { _all: true },
    }),
  ]);

  for (const id of tripIds) {
    map.set(id, 0);
  }
  for (const group of reservationGroups) {
    map.set(group.tripId, (map.get(group.tripId) ?? 0) + group._count._all);
  }
  for (const group of pendingGroups) {
    map.set(group.tripId, (map.get(group.tripId) ?? 0) + group._count._all);
  }

  return map;
}

export function computeRemainingSeats(totalSeats: number, occupiedSeats: number): number {
  return Math.max(0, totalSeats - occupiedSeats);
}
