import { NEAR_DEPARTURE_THRESHOLD_MINUTES } from "@/types/departures.types";

/** Minutes until departure (negative if past). */
export function minutesUntilDeparture(departureTime: string, now = Date.now()): number {
  const departure = new Date(departureTime).getTime();
  if (Number.isNaN(departure)) return Number.NaN;
  return Math.round((departure - now) / 60_000);
}

export function isNearDeparture(
  departureTime: string,
  thresholdMinutes = NEAR_DEPARTURE_THRESHOLD_MINUTES,
  now = Date.now()
): boolean {
  const minutes = minutesUntilDeparture(departureTime, now);
  if (Number.isNaN(minutes)) return false;
  return minutes >= 0 && minutes < thresholdMinutes;
}

/**
 * Future V2: replace "Soon" badge with "Départ dans X min".
 * Not used in V1 UI — helper ready for countdown badge component.
 */
export function formatDepartureCountdownLabel(
  departureTime: string,
  now = Date.now()
): string | null {
  const minutes = minutesUntilDeparture(departureTime, now);
  if (Number.isNaN(minutes) || minutes < 0) return null;
  if (minutes === 0) return "Départ imminent";
  return `Départ dans ${minutes} min`;
}
