import { getUiDemoTripsPool } from "@/features/trips/demo/demo-trips";
import { sortTripsByDeparture } from "@/lib/trip-availability";
import { toParisDateKey, todayParisDateKey } from "@/lib/format-date";
import { isUiDemoTripsEnabled } from "@/lib/ui-demo-trips";
import type { PublicTrip } from "@/types/trips.types";

export const UI_DEMO_MIN_FUTURE_TRIPS = 4;

function tripFingerprint(trip: PublicTrip): string {
  return `${trip.departureTime}|${trip.line.startCity}|${trip.line.endCity}`;
}

function filterFutureTrips(trips: PublicTrip[], now: Date): PublicTrip[] {
  return trips.filter((trip) => new Date(trip.departureTime).getTime() > now.getTime());
}

function filterTripsForDateKey(trips: PublicTrip[], dateKey: string): PublicTrip[] {
  return trips.filter((trip) => toParisDateKey(new Date(trip.departureTime)) === dateKey);
}

export interface MergeUiDemoTripsOptions {
  /** Filtre date YYYY-MM-DD (Europe/Paris) — aligné requête `/api/trips?date=`. */
  dateKey?: string;
  now?: Date;
}

/**
 * Complète la réponse API avec des trajets démo si le flag est actif
 * et qu'il y a moins de 4 trajets futurs pertinents.
 * Les trajets API ne sont jamais remplacés.
 */
export function mergeTripsWithUiDemo(
  apiTrips: PublicTrip[],
  options: MergeUiDemoTripsOptions = {}
): PublicTrip[] {
  if (!isUiDemoTripsEnabled()) {
    return apiTrips;
  }

  const now = options.now ?? new Date();
  const apiSorted = sortTripsByDeparture(apiTrips);

  if (options.dateKey && options.dateKey < todayParisDateKey()) {
    return apiSorted;
  }

  const futureApiTrips = filterFutureTrips(apiSorted, now);
  const countable =
    options.dateKey != null
      ? filterTripsForDateKey(futureApiTrips, options.dateKey)
      : futureApiTrips;

  if (countable.length >= UI_DEMO_MIN_FUTURE_TRIPS) {
    return apiSorted;
  }

  const existingFingerprints = new Set(apiSorted.map(tripFingerprint));
  const needed = UI_DEMO_MIN_FUTURE_TRIPS - countable.length;

  const demoCandidates = getUiDemoTripsPool(now).filter((trip) => {
    if (existingFingerprints.has(tripFingerprint(trip))) {
      return false;
    }
    if (options.dateKey && toParisDateKey(new Date(trip.departureTime)) !== options.dateKey) {
      return false;
    }
    return true;
  });

  const toAdd = demoCandidates.slice(0, needed);
  if (toAdd.length === 0) {
    return apiSorted;
  }

  return sortTripsByDeparture([...apiSorted, ...toAdd]);
}
