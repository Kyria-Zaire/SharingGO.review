import type { AdminTrip, TripOccupancy, TripUiStatus } from "@/types/trips.types";

/**
 * Derives a display-only status for the admin trips table.
 * Backend remains source of truth; occupancy.isFull is optional (on-demand load).
 */
export function deriveTripUiStatus(
  trip: Pick<AdminTrip, "departureTime" | "deletedAt">,
  occupancy?: Pick<TripOccupancy, "isFull"> | null
): TripUiStatus {
  if (trip.deletedAt) {
    return "disabled";
  }

  const departure = new Date(trip.departureTime);
  if (departure.getTime() <= Date.now()) {
    return "past";
  }

  if (occupancy?.isFull) {
    return "full";
  }

  return "upcoming";
}
