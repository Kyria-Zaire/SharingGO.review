const PARIS_TZ = "Europe/Paris";

export function formatDate(
  value: string | Date,
  locale = "fr-FR",
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: PARIS_TZ }).format(date);
}

export function formatTime(value: string | Date, locale = "fr-FR"): string {
  return formatDate(value, locale, { timeStyle: "short" });
}

export function formatDayLabel(value: string | Date, locale = "fr-FR"): string {
  return formatDate(value, locale, { weekday: "long", day: "numeric", month: "long" });
}

/** Date trajet (ex. « 20 juin 2025 ») — timeline détail. */
export function formatTripCalendarDate(value: string | Date, locale = "fr-FR"): string {
  return formatDate(value, locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** YYYY-MM-DD in Europe/Paris — aligned with backend `date` query param. */
export function toParisDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addParisDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(year!, month! - 1, day! + days, 12, 0, 0));
  return toParisDateKey(utc);
}

export function todayParisDateKey(): string {
  return toParisDateKey(new Date());
}

export function tomorrowParisDateKey(): string {
  return addParisDays(todayParisDateKey(), 1);
}

/** Durée trajet lisible (ex. "40 min", "1 h 10 min"). */
export function formatTripDuration(
  departureTime: string,
  arrivalTime: string | null
): string | null {
  if (!arrivalTime) return null;

  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  if (Number.isNaN(departure.getTime()) || Number.isNaN(arrival.getTime())) {
    return null;
  }

  const totalMinutes = Math.round((arrival.getTime() - departure.getTime()) / 60_000);
  if (totalMinutes <= 0) return null;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} h ${minutes} min`;
  }
  if (hours > 0) {
    return `${hours} h`;
  }
  return `${minutes} min`;
}

/** Décalage UTC→Paris (minutes) pour une date civile Europe/Paris. */
function getParisUtcOffsetMinutes(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utcNoon = new Date(Date.UTC(year!, month! - 1, day!, 12, 0, 0));
  const parisHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: PARIS_TZ,
      hour: "numeric",
      hour12: false,
    }).format(utcNoon)
  );
  return (parisHour - 12) * 60;
}

/** ISO UTC pour une heure murale Europe/Paris (YYYY-MM-DD + heure). */
export function buildParisIsoDateTime(dateKey: string, hour: number, minute: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const offsetMinutes = getParisUtcOffsetMinutes(dateKey);
  const utcMs = Date.UTC(year!, month! - 1, day!, hour, minute) - offsetMinutes * 60_000;
  return new Date(utcMs).toISOString();
}
