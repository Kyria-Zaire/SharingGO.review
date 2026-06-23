import { toParisDateKey, todayParisDateKey, tomorrowParisDateKey, formatDate } from "@/lib/format-date";
import { normalizeTripSeats } from "@/lib/trip-availability";
import type { PublicTrip } from "@/types/trips.types";

export function shortCityLabel(city: string): string {
  if (city.toLowerCase().includes("châlons") || city.toLowerCase().includes("chalons")) {
    return "Châlons";
  }
  if (city.toLowerCase().includes("vatry")) {
    return "Vatry";
  }
  return city;
}

export function formatTripRouteShort(trip: PublicTrip): string {
  return `${shortCityLabel(trip.line.startCity)} → ${shortCityLabel(trip.line.endCity)}`;
}

export function formatRemainingSeatsLabel(trip: PublicTrip): string {
  const { remainingSeats } = normalizeTripSeats(trip);
  return `${remainingSeats} place${remainingSeats > 1 ? "s" : ""} restante${remainingSeats > 1 ? "s" : ""}`;
}

export function isTripToday(trip: PublicTrip): boolean {
  const departureKey = toParisDateKey(new Date(trip.departureTime));
  return departureKey === todayParisDateKey();
}

export function isTripTomorrow(trip: PublicTrip): boolean {
  const departureKey = toParisDateKey(new Date(trip.departureTime));
  return departureKey === tomorrowParisDateKey();
}

/** Badge court pour les départs au-delà de demain. */
export function formatTripDayBadgeLabel(trip: PublicTrip): string {
  return formatDate(trip.departureTime, "fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export const LANDING_TICKET_PRICE_LABEL = "8,00 €";
