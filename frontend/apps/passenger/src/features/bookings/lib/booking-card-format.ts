import { DEMO_BOOKING_ID_PREFIX } from "@/lib/ui-demo-trips";
import { TRIP_DETAIL_STOP_POINTS } from "@/features/trips/constants/trip-detail-content";
import { formatTime } from "@/lib/format-date";
import { isChalonsCity, isVatryCity } from "@/lib/trip-city-labels";

const PARIS_TZ = "Europe/Paris";

export interface BookingCardDateParts {
  weekday: string;
  day: string;
  month: string;
  time: string;
}

export function formatBookingCardDateParts(departureTime: string): BookingCardDateParts {
  const date = new Date(departureTime);

  const weekday = new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS_TZ,
    weekday: "short",
  })
    .format(date)
    .replace(/\.$/, "")
    .toUpperCase();

  const day = new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS_TZ,
    day: "2-digit",
  }).format(date);

  const month = new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS_TZ,
    month: "short",
  })
    .format(date)
    .replace(/\.$/, "")
    .toUpperCase();

  return {
    weekday,
    day,
    month,
    time: formatTime(departureTime),
  };
}

/** Référence affichée type maquette (#SG254812) — démo : #SGDEMO-*. */
export function formatBookingPublicReference(reservationId: string): string {
  if (reservationId.startsWith(DEMO_BOOKING_ID_PREFIX)) {
    const suffix = reservationId.slice(DEMO_BOOKING_ID_PREFIX.length).toUpperCase();
    return `#SGDEMO-${suffix}`;
  }
  const compact = reservationId.replace(/-/g, "").toUpperCase();
  return `#SG${compact.slice(0, 6)}`;
}

export function resolveBookingStopPoint(city: string): string {
  if (isChalonsCity(city)) return TRIP_DETAIL_STOP_POINTS.chalons;
  if (isVatryCity(city)) return TRIP_DETAIL_STOP_POINTS.vatry;
  return "";
}
