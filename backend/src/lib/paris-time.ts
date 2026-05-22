const PARIS_TZ = "Europe/Paris";

interface ParisWallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function parisWallClock(utc: Date): ParisWallClock {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: PARIS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(utc)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** Converts a Paris local wall-clock instant to UTC. */
function parisLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number
): Date {
  let candidate = Date.UTC(year, month - 1, day, hour - 1, minute, second, millisecond);

  for (let i = 0; i < 8; i++) {
    const clock = parisWallClock(new Date(candidate));
    const target = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
    const actual = Date.UTC(
      clock.year,
      clock.month - 1,
      clock.day,
      clock.hour,
      clock.minute,
      clock.second,
      millisecond
    );
    const delta = target - actual;
    if (delta === 0) {
      return new Date(candidate);
    }
    candidate += delta;
  }

  return new Date(candidate);
}

/** Start and end of a calendar day in Europe/Paris, expressed as UTC Date bounds. */
export function parisDayBoundsUtc(dateStr: string): { start: Date; end: Date } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid Paris date: ${dateStr}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return {
    start: parisLocalToUtc(year, month, day, 0, 0, 0, 0),
    end: parisLocalToUtc(year, month, day, 23, 59, 59, 999),
  };
}

/** Start of the current calendar day in Europe/Paris (UTC instant). */
export function startOfTodayParisUtc(): Date {
  const now = new Date();
  const clock = parisWallClock(now);
  const y = clock.year;
  const m = String(clock.month).padStart(2, "0");
  const d = String(clock.day).padStart(2, "0");
  return parisDayBoundsUtc(`${y}-${m}-${d}`).start;
}
