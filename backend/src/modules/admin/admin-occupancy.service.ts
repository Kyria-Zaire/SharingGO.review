import { ReservationStatus } from "@prisma/client";
import { AppError } from "../../lib/errors.js";
import { computeRemainingSeats, deleteExpiredPendingForTrip } from "../../lib/trip-occupancy.js";
import { prisma } from "../../lib/prisma.js";
import { formatTripOccupancy } from "./admin.serializers.js";
import type { TripOccupancyResult } from "./admin.types.js";

export async function getAdminTripOccupancy(tripId: string): Promise<TripOccupancyResult> {
  const now = new Date();
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { line: true },
  });

  if (!trip) {
    throw new AppError("Trip not found", 404, "TRIP_NOT_FOUND");
  }

  await deleteExpiredPendingForTrip(prisma, tripId, now);

  const [confirmedSeats, usedSeats, activePendingSeats] = await Promise.all([
    prisma.reservation.count({
      where: { tripId, status: ReservationStatus.CONFIRMED },
    }),
    prisma.reservation.count({
      where: { tripId, status: ReservationStatus.USED },
    }),
    prisma.pendingReservation.count({
      where: {
        tripId,
        expiresAt: { gt: now },
        consumedAt: null,
      },
    }),
  ]);

  const occupiedSeats = confirmedSeats + usedSeats + activePendingSeats;
  const remainingSeats = computeRemainingSeats(trip.totalSeats, occupiedSeats);

  return {
    trip: formatTripOccupancy(trip),
    totalSeats: trip.totalSeats,
    confirmedSeats,
    usedSeats,
    activePendingSeats,
    occupiedSeats,
    remainingSeats,
    isFull: remainingSeats <= 0,
  };
}
