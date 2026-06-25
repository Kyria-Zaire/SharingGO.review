import {
  formatTime,
  formatTripCalendarDate,
  todayParisDateKey,
  tomorrowParisDateKey,
  toParisDateKey,
} from "@/lib/format-date";

/** Libellé temporel pour trajets à venir (données réelles uniquement). */
export function formatBookingDepartureCountdown(
  departureTime: string,
  now = new Date()
): string | null {
  const departure = new Date(departureTime);
  if (Number.isNaN(departure.getTime()) || departure.getTime() <= now.getTime()) {
    return null;
  }

  const diffMs = departure.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const timeLabel = formatTime(departureTime);
  const dateKey = toParisDateKey(departure);
  const today = todayParisDateKey();
  const tomorrow = tomorrowParisDateKey();

  if (diffMinutes < 24 * 60) {
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    if (hours > 0 && minutes > 0) {
      return `Départ dans ${hours}h${String(minutes).padStart(2, "0")}`;
    }
    if (hours > 0) {
      return `Départ dans ${hours}h`;
    }
    return `Départ dans ${minutes} min`;
  }

  if (dateKey === today) {
    return `Aujourd'hui à ${timeLabel}`;
  }

  if (dateKey === tomorrow) {
    return `Demain à ${timeLabel}`;
  }

  const startOfTodayParis = parisDayStartUtc(today);
  const startOfDepartureParis = parisDayStartUtc(dateKey);
  const dayDiff = Math.round(
    (startOfDepartureParis - startOfTodayParis) / (24 * 60 * 60 * 1000)
  );

  if (dayDiff >= 2 && dayDiff <= 14) {
    return `Dans ${dayDiff} jours`;
  }

  return formatTripCalendarDate(departureTime);
}

function parisDayStartUtc(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utcNoon = Date.UTC(year!, month! - 1, day!, 12, 0, 0);
  const parisHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Paris",
      hour: "numeric",
      hour12: false,
    }).format(utcNoon)
  );
  const offsetMinutes = (parisHour - 12) * 60;
  return Date.UTC(year!, month! - 1, day!, 0, 0, 0) - offsetMinutes * 60_000;
}
