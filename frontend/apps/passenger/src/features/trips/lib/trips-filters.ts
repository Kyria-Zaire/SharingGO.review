import { formatTime } from "@/lib/format-date";
import { isChalonsCity, isVatryCity } from "@/lib/trip-city-labels";
import {
  deriveTripAvailability,
  isTripBookable,
  normalizeTripSeats,
  sortTripsByDeparture,
} from "@/lib/trip-availability";
import type { PublicTrip } from "@/types/trips.types";

export type TripDirectionFilter = "chalons-vatry" | "vatry-chalons";

export type TripTimeFilter = "all" | "morning" | "afternoon" | "evening";

export type TripSeatsFilter = "all" | "available";

export type TripSortOption = "departure" | "seats";

export interface TripsClientFilters {
  direction: TripDirectionFilter;
  time: TripTimeFilter;
  seats: TripSeatsFilter;
  sort: TripSortOption;
}

export const DEFAULT_TRIPS_CLIENT_FILTERS: TripsClientFilters = {
  direction: "chalons-vatry",
  time: "all",
  seats: "all",
  sort: "departure",
};

export function swapDirection(direction: TripDirectionFilter): TripDirectionFilter {
  return direction === "chalons-vatry" ? "vatry-chalons" : "chalons-vatry";
}

export function directionLabel(direction: TripDirectionFilter): string {
  return direction === "chalons-vatry"
    ? "Châlons-en-Champagne → Vatry"
    : "Vatry → Châlons-en-Champagne";
}

export function tripMatchesDirection(trip: PublicTrip, direction: TripDirectionFilter): boolean {
  if (direction === "chalons-vatry") {
    return isChalonsCity(trip.line.startCity);
  }
  return isVatryCity(trip.line.startCity);
}

function tripParisHour(trip: PublicTrip): number {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date(trip.departureTime));
  const hour = parts.find((p) => p.type === "hour")?.value;
  return hour ? Number.parseInt(hour, 10) : 0;
}

export function tripMatchesTimeFilter(trip: PublicTrip, time: TripTimeFilter): boolean {
  if (time === "all") return true;
  const hour = tripParisHour(trip);
  if (time === "morning") return hour < 12;
  if (time === "afternoon") return hour >= 12 && hour < 18;
  return hour >= 18;
}

export function tripMatchesSeatsFilter(trip: PublicTrip, seats: TripSeatsFilter): boolean {
  if (seats === "all") return true;
  const availability = deriveTripAvailability(trip);
  if (!isTripBookable(availability)) return false;
  return normalizeTripSeats(trip).remainingSeats > 0;
}

export function countActiveClientFilters(filters: TripsClientFilters): number {
  let count = 0;
  if (filters.direction !== DEFAULT_TRIPS_CLIENT_FILTERS.direction) count += 1;
  if (filters.time !== "all") count += 1;
  if (filters.seats !== "all") count += 1;
  return count;
}

export function applyTripsClientFilters(
  trips: PublicTrip[],
  filters: TripsClientFilters
): PublicTrip[] {
  const filtered = trips.filter(
    (trip) =>
      tripMatchesDirection(trip, filters.direction) &&
      tripMatchesTimeFilter(trip, filters.time) &&
      tripMatchesSeatsFilter(trip, filters.seats)
  );

  if (filters.sort === "seats") {
    return [...filtered].sort((a, b) => {
      const seatsA = normalizeTripSeats(a).remainingSeats;
      const seatsB = normalizeTripSeats(b).remainingSeats;
      if (seatsB !== seatsA) return seatsB - seatsA;
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    });
  }

  return sortTripsByDeparture(filtered);
}

export function formatTripSortLabel(sort: TripSortOption): string {
  if (sort === "seats") return "Places restantes";
  return "Heure de départ";
}

export function formatTripTimeFilterLabel(time: TripTimeFilter): string {
  switch (time) {
    case "morning":
      return "Matin (avant 12 h)";
    case "afternoon":
      return "Après-midi (12 h – 18 h)";
    case "evening":
      return "Soir (après 18 h)";
    default:
      return "Toutes les heures";
  }
}

export function formatTripSeatsFilterLabel(seats: TripSeatsFilter): string {
  return seats === "available" ? "Avec places disponibles" : "Toutes";
}

/** Libellé horaire pour affichage filtre actif. */
export function formatTripDepartureHourLabel(trip: PublicTrip): string {
  return formatTime(trip.departureTime);
}
