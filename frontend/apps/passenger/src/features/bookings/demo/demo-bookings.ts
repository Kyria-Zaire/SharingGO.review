import {
  addParisDays,
  buildParisIsoDateTime,
  todayParisDateKey,
} from "@/lib/format-date";
import { DEMO_BOOKING_ID_PREFIX } from "@/lib/ui-demo-trips";
import type {
  UserReservationListItem,
  UserReservationPayment,
  UserReservationTrip,
} from "@/types/reservations";

const TRIP_DURATION_MINUTES = 40;
const TICKET_AMOUNT = "8.00";

const DEMO_LINE_CHALONS_VATRY = {
  id: "demo-line-chalons-vatry",
  name: "Châlons-en-Champagne <-> Aéroport Paris-Vatry",
  startCity: "Châlons-en-Champagne",
  endCity: "Aéroport Paris-Vatry",
};

const DEMO_LINE_VATRY_CHALONS = {
  id: "demo-line-vatry-chalons",
  name: "Aéroport Paris-Vatry <-> Châlons-en-Champagne",
  startCity: "Aéroport Paris-Vatry",
  endCity: "Châlons-en-Champagne",
};

interface DemoBookingSpec {
  idSuffix: string;
  status: "CONFIRMED" | "PENDING" | "USED" | "CANCELED";
  paymentStatus: UserReservationPayment["status"] | null;
  dayOffset: number;
  hour: number;
  minute: number;
  direction: "chalons-vatry" | "vatry-chalons";
  createdAtDayOffset: number;
}

const DEMO_BOOKING_SPECS: DemoBookingSpec[] = [
  {
    idSuffix: "upcoming-confirmed-01",
    status: "CONFIRMED",
    paymentStatus: "SUCCEEDED",
    dayOffset: 1,
    hour: 7,
    minute: 0,
    direction: "chalons-vatry",
    createdAtDayOffset: -2,
  },
  {
    idSuffix: "upcoming-confirmed-02",
    status: "CONFIRMED",
    paymentStatus: "SUCCEEDED",
    dayOffset: 2,
    hour: 17,
    minute: 30,
    direction: "vatry-chalons",
    createdAtDayOffset: -1,
  },
  {
    idSuffix: "upcoming-pending-01",
    status: "PENDING",
    paymentStatus: "PENDING",
    dayOffset: 1,
    hour: 12,
    minute: 30,
    direction: "chalons-vatry",
    createdAtDayOffset: 0,
  },
  {
    idSuffix: "past-used-01",
    status: "USED",
    paymentStatus: "SUCCEEDED",
    dayOffset: -3,
    hour: 7,
    minute: 0,
    direction: "chalons-vatry",
    createdAtDayOffset: -10,
  },
  {
    idSuffix: "past-used-02",
    status: "USED",
    paymentStatus: "SUCCEEDED",
    dayOffset: -8,
    hour: 18,
    minute: 30,
    direction: "vatry-chalons",
    createdAtDayOffset: -14,
  },
  {
    idSuffix: "canceled-01",
    status: "CANCELED",
    paymentStatus: "FAILED",
    dayOffset: 2,
    hour: 9,
    minute: 0,
    direction: "vatry-chalons",
    createdAtDayOffset: -4,
  },
];

function buildDemoTrip(
  spec: DemoBookingSpec,
  departureTime: string
): UserReservationTrip {
  const line =
    spec.direction === "chalons-vatry" ? DEMO_LINE_CHALONS_VATRY : DEMO_LINE_VATRY_CHALONS;
  const departure = new Date(departureTime);
  const arrival = new Date(departure.getTime() + TRIP_DURATION_MINUTES * 60_000);

  return {
    id: `demo-trip-booking-${spec.idSuffix}`,
    departureTime: departure.toISOString(),
    arrivalTime: arrival.toISOString(),
    line,
  };
}

function buildDemoPayment(
  spec: DemoBookingSpec,
  reservationId: string
): UserReservationPayment | null {
  if (!spec.paymentStatus) {
    return null;
  }

  return {
    id: `demo-payment-${reservationId}`,
    status: spec.paymentStatus,
    type: "TICKET",
    amount: TICKET_AMOUNT,
    currency: "eur",
    createdAt: buildParisIsoDateTime(
      addParisDays(todayParisDateKey(), spec.createdAtDayOffset),
      spec.hour,
      spec.minute
    ),
  };
}

function buildDemoBooking(spec: DemoBookingSpec): UserReservationListItem {
  const dateKey = addParisDays(todayParisDateKey(), spec.dayOffset);
  const departureTime = buildParisIsoDateTime(dateKey, spec.hour, spec.minute);
  const reservationId = `${DEMO_BOOKING_ID_PREFIX}${spec.idSuffix}`;

  return {
    id: reservationId,
    status: spec.status,
    trip: buildDemoTrip(spec, departureTime),
    payment: buildDemoPayment(spec, reservationId),
    createdAt: buildParisIsoDateTime(
      addParisDays(todayParisDateKey(), spec.createdAtDayOffset),
      10,
      0
    ),
  };
}

/** Pool fixe — IDs `demo-booking-*`, références `#SGDEMO-*` côté UI. */
export function getUiDemoBookingsPool(): UserReservationListItem[] {
  return DEMO_BOOKING_SPECS.map(buildDemoBooking);
}

export function findUiDemoBooking(reservationId: string): UserReservationListItem | null {
  if (!reservationId.startsWith(DEMO_BOOKING_ID_PREFIX)) {
    return null;
  }
  return getUiDemoBookingsPool().find((booking) => booking.id === reservationId) ?? null;
}
