import {
  addParisDays,
  buildParisIsoDateTime,
  todayParisDateKey,
} from "@/lib/format-date";
import { sortTripsByDeparture } from "@/lib/trip-availability";
import { DEMO_TRIP_ID_PREFIX } from "@/lib/ui-demo-trips";
import type { PublicLine, PublicTrip } from "@/types/trips.types";

const TRIP_DURATION_MINUTES = 40;
const TOTAL_SEATS = 8;
const TICKET_PRICE_CENTS = 800;

const DEMO_LINE_CHALONS_VATRY: PublicLine = {
  id: "demo-line-chalons-vatry",
  name: "Châlons-en-Champagne <-> Aéroport Paris-Vatry",
  startCity: "Châlons-en-Champagne",
  endCity: "Aéroport Paris-Vatry",
};

const DEMO_LINE_VATRY_CHALONS: PublicLine = {
  id: "demo-line-vatry-chalons",
  name: "Aéroport Paris-Vatry <-> Châlons-en-Champagne",
  startCity: "Aéroport Paris-Vatry",
  endCity: "Châlons-en-Champagne",
};

type DemoDirection = "chalons-vatry" | "vatry-chalons";

interface DemoTripSpec {
  idSuffix: string;
  dayOffset: number;
  hour: number;
  minute: number;
  direction: DemoDirection;
  reservedSeats: number;
}

/** 8 créneaux variés — recalculés à chaque appel (dates futures relatives). */
const DEMO_TRIP_SPECS: DemoTripSpec[] = [
  { idSuffix: "01", dayOffset: 0, hour: 6, minute: 30, direction: "chalons-vatry", reservedSeats: 0 },
  { idSuffix: "02", dayOffset: 0, hour: 9, minute: 0, direction: "vatry-chalons", reservedSeats: 2 },
  { idSuffix: "03", dayOffset: 0, hour: 12, minute: 30, direction: "chalons-vatry", reservedSeats: 6 },
  { idSuffix: "04", dayOffset: 0, hour: 16, minute: 0, direction: "vatry-chalons", reservedSeats: 0 },
  { idSuffix: "05", dayOffset: 1, hour: 7, minute: 15, direction: "chalons-vatry", reservedSeats: 1 },
  { idSuffix: "06", dayOffset: 1, hour: 11, minute: 45, direction: "vatry-chalons", reservedSeats: 7 },
  { idSuffix: "07", dayOffset: 1, hour: 15, minute: 30, direction: "chalons-vatry", reservedSeats: 3 },
  { idSuffix: "08", dayOffset: 2, hour: 8, minute: 0, direction: "vatry-chalons", reservedSeats: 0 },
];

function lineForDirection(direction: DemoDirection): PublicLine {
  return direction === "chalons-vatry" ? DEMO_LINE_CHALONS_VATRY : DEMO_LINE_VATRY_CHALONS;
}

function buildDemoTrip(spec: DemoTripSpec, departureTime: string): PublicTrip {
  const line = lineForDirection(spec.direction);
  const departure = new Date(departureTime);
  const arrival = new Date(departure.getTime() + TRIP_DURATION_MINUTES * 60_000);
  const reservedSeats = Math.min(Math.max(0, spec.reservedSeats), TOTAL_SEATS);
  const remainingSeats = TOTAL_SEATS - reservedSeats;

  return {
    id: `${DEMO_TRIP_ID_PREFIX}${spec.idSuffix}`,
    line,
    departureTime: departure.toISOString(),
    arrivalTime: arrival.toISOString(),
    totalSeats: TOTAL_SEATS,
    reservedSeats,
    remainingSeats,
    isFull: remainingSeats <= 0,
  };
}

/** Pool de trajets démo futurs — IDs préfixés `demo-trip-`. */
export function getUiDemoTripsPool(now = new Date()): PublicTrip[] {
  const today = todayParisDateKey();
  const trips: PublicTrip[] = [];

  for (const spec of DEMO_TRIP_SPECS) {
    const dateKey = addParisDays(today, spec.dayOffset);
    const departureTime = buildParisIsoDateTime(dateKey, spec.hour, spec.minute);
    if (new Date(departureTime) <= now) {
      continue;
    }
    trips.push(buildDemoTrip(spec, departureTime));
  }

  return sortTripsByDeparture(trips);
}

export function findUiDemoTrip(tripId: string, now = new Date()): PublicTrip | null {
  return getUiDemoTripsPool(now).find((trip) => trip.id === tripId) ?? null;
}

/**
 * Résolution page détail — IDs `demo-trip-*` stables pour la QA UI même si le créneau
 * est passé dans la journée (les listes n’injectent que les futurs).
 */
export function findUiDemoTripForDetail(tripId: string): PublicTrip | null {
  if (!tripId.startsWith(DEMO_TRIP_ID_PREFIX)) {
    return null;
  }

  const idSuffix = tripId.slice(DEMO_TRIP_ID_PREFIX.length);
  const spec = DEMO_TRIP_SPECS.find((entry) => entry.idSuffix === idSuffix);
  if (!spec) {
    return null;
  }

  const dateKey = addParisDays(todayParisDateKey(), spec.dayOffset);
  const departureTime = buildParisIsoDateTime(dateKey, spec.hour, spec.minute);
  return buildDemoTrip(spec, departureTime);
}

/** Exporté pour documentation — prix affiché 8,00 € (CDC V1). */
export const UI_DEMO_TICKET_PRICE_CENTS = TICKET_PRICE_CENTS;
