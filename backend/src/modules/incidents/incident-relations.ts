import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

export async function assertTripExistsForIncident(
  tripId: string,
  options?: { allowDisabled?: boolean }
): Promise<void> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true, deletedAt: true },
  });
  if (!trip) {
    throw new AppError("Trip not found", 404, "TRIP_NOT_FOUND");
  }
  if (!options?.allowDisabled && trip.deletedAt !== null) {
    throw new AppError("Trip not found", 404, "TRIP_NOT_FOUND");
  }
}

export async function assertReservationOnTrip(
  reservationId: string,
  tripId: string
): Promise<void> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: { id: true, tripId: true },
  });
  if (!reservation) {
    throw new AppError("Reservation not found", 404, "RESERVATION_NOT_FOUND");
  }
  if (reservation.tripId !== tripId) {
    throw new AppError("Reservation does not belong to trip", 409, "RESERVATION_TRIP_MISMATCH");
  }
}
