import { formatTripCityFull } from "@/lib/trip-city-labels";
import type { PublicTrip } from "@/types/trips.types";

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Génère un fichier .ics pour le trajet (client-side, sans API). */
export function buildTripCalendarIcs(trip: PublicTrip): string {
  const departure = new Date(trip.departureTime);
  const arrival = trip.arrivalTime
    ? new Date(trip.arrivalTime)
    : new Date(departure.getTime() + 55 * 60_000);

  const start = formatIcsDate(departure);
  const end = formatIcsDate(arrival);
  const route = `${formatTripCityFull(trip.line.startCity)} → ${formatTripCityFull(trip.line.endCity)}`;
  const uid = `sharinggo-trip-${trip.id}@sharinggo.fr`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SharingGO//Trip//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:SharingGO — ${route}`,
    `DESCRIPTION:Trajet SharingGO. Présentez votre QR à l'embarquement.`,
    "LOCATION:SharingGO",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadTripCalendarIcs(trip: PublicTrip): void {
  const ics = buildTripCalendarIcs(trip);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `sharinggo-trajet-${trip.id}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}
