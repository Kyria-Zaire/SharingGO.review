import type { AdminReservation } from "@/types/reservations.types";
import type { AdminTrip, TripOccupancy } from "@/types/trips.types";
import type {
  DepartureIncident,
  DepartureIncidentSeverity,
  DepartureReadinessStatus,
  DepartureTripView,
} from "@/types/departures.types";
import { DEPARTURE_READINESS_PRIORITY } from "@/types/departures.types";
import {
  computeDepartureReadiness,
  computePercentBoarded,
  isBoardingComplete,
} from "./departure-readiness";
import { isNearDeparture } from "./departure-time";

const SEVERITY_BY_KIND: Record<string, DepartureIncidentSeverity> = {
  near_departure: "info",
  full_not_boarded: "warning",
  boarding_late: "warning",
  no_passengers: "info",
  no_boarding_activity: "warning",
  unknown_readiness: "warning",
};

function incident(id: string, label: string, kind: string): DepartureIncident {
  return {
    id,
    label,
    heuristicKind: kind as DepartureIncident["heuristicKind"],
    severity: SEVERITY_BY_KIND[kind] ?? "info",
  };
}

export function computeDepartureIncidents(
  trip: AdminTrip,
  occupancy: TripOccupancy | null,
  readiness: DepartureReadinessStatus,
  now = Date.now()
): DepartureIncident[] {
  const incidents: DepartureIncident[] = [];
  const departure = new Date(trip.departureTime).getTime();

  if (isNearDeparture(trip.departureTime, undefined, now)) {
    incidents.push(incident("near", "Departure soon", "near_departure"));
  }

  if (readiness === "EMPTY") {
    incidents.push(incident("empty", "No passengers", "no_passengers"));
  }

  if (readiness === "UNKNOWN") {
    incidents.push(incident("unknown", "Unknown readiness", "unknown_readiness"));
  }

  if (occupancy) {
    if (
      occupancy.occupiedSeats > 0 &&
      occupancy.usedSeats === 0 &&
      isNearDeparture(trip.departureTime, undefined, now)
    ) {
      incidents.push(
        incident("no_activity", "No boarding activity", "no_boarding_activity")
      );
    }

    if (occupancy.isFull && occupancy.usedSeats < occupancy.occupiedSeats) {
      incidents.push(incident("full", "Full but passengers not boarded", "full_not_boarded"));
    }

    if (!Number.isNaN(departure) && now > departure && occupancy.confirmedSeats > 0) {
      incidents.push(incident("late", "Boarding started late", "boarding_late"));
    }
  }

  return incidents;
}

export function buildDepartureTripView(
  trip: AdminTrip,
  occupancy: TripOccupancy | null,
  occupancyLoaded: boolean,
  now = Date.now()
): DepartureTripView {
  const readiness = occupancyLoaded ? computeDepartureReadiness(occupancy) : "UNKNOWN";
  const boardedCount = occupancy?.usedSeats ?? 0;
  const remainingBoardingCount = occupancy?.confirmedSeats ?? 0;
  const occupiedSeats = occupancy?.occupiedSeats ?? 0;

  const guardedReadiness: DepartureReadinessStatus =
    readiness === "READY" && boardedCount === 0 ? "WAITING_PASSENGERS" : readiness;

  return {
    tripId: trip.id,
    lineName: trip.line.name,
    routeLabel: `${trip.line.startCity} → ${trip.line.endCity}`,
    departureTime: trip.departureTime,
    totalSeats: trip.totalSeats,
    occupiedSeats,
    boardedCount,
    remainingBoardingCount,
    activePendingSeats: occupancy?.activePendingSeats ?? 0,
    percentBoarded: computePercentBoarded(boardedCount, occupiedSeats),
    readiness: guardedReadiness,
    boardingComplete: isBoardingComplete(occupancy),
    nearDeparture: isNearDeparture(trip.departureTime, undefined, now),
    isFull: occupancy?.isFull ?? false,
    isDisabled: Boolean(trip.deletedAt),
    incidents: computeDepartureIncidents(trip, occupancy, guardedReadiness, now),
    occupancyLoaded,
  };
}

export function sortDepartureViews(views: DepartureTripView[]): DepartureTripView[] {
  return [...views].sort((a, b) => {
    const priorityDiff =
      DEPARTURE_READINESS_PRIORITY[a.readiness] - DEPARTURE_READINESS_PRIORITY[b.readiness];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
  });
}

export function countReservationsByTrip(
  reservations: AdminReservation[]
): Map<string, { confirmed: number; used: number; pending: number }> {
  const map = new Map<string, { confirmed: number; used: number; pending: number }>();

  for (const reservation of reservations) {
    const tripId = reservation.trip.id;
    const entry = map.get(tripId) ?? { confirmed: 0, used: 0, pending: 0 };
    if (reservation.status === "CONFIRMED") entry.confirmed += 1;
    else if (reservation.status === "USED") entry.used += 1;
    else if (reservation.status === "PENDING") entry.pending += 1;
    map.set(tripId, entry);
  }

  return map;
}
