import type { TripOccupancy } from "@/types/trips.types";
import type { DepartureReadinessStatus } from "@/types/departures.types";

/**
 * Computes UX readiness from occupancy snapshot.
 * READY stabilization guard: never READY when boardedCount === 0.
 */
export function computeDepartureReadiness(occupancy: TripOccupancy | null): DepartureReadinessStatus {
  if (!occupancy) {
    return "UNKNOWN";
  }

  const { usedSeats, confirmedSeats, occupiedSeats, activePendingSeats } = occupancy;

  if (occupiedSeats === 0) {
    return "EMPTY";
  }

  if (usedSeats === 0 && (confirmedSeats > 0 || activePendingSeats > 0)) {
    return "WAITING_PASSENGERS";
  }

  if (usedSeats > 0 && confirmedSeats > 0) {
    return "BOARDING_IN_PROGRESS";
  }

  if (usedSeats > 0 && confirmedSeats === 0) {
    return "READY";
  }

  return "UNKNOWN";
}

export function isBoardingComplete(occupancy: TripOccupancy | null): boolean {
  if (!occupancy) return false;
  const { occupiedSeats, usedSeats } = occupancy;
  return occupiedSeats > 0 && occupiedSeats === usedSeats;
}

export function computePercentBoarded(boardedCount: number, occupiedSeats: number): number {
  if (occupiedSeats <= 0) return 0;
  return Math.round((boardedCount / occupiedSeats) * 100);
}
