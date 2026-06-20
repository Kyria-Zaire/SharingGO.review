import { formatDate } from "@/lib/format-date";
import { formatShortId } from "@/lib/format-id";
import type { AdminTrip } from "@/types/trips.types";

export interface IncidentTripDisplay {
  primary: string;
  secondary?: string;
}

export function formatIncidentTripDisplay(
  trip: AdminTrip | undefined,
  tripId: string
): IncidentTripDisplay {
  if (trip?.line) {
    return {
      primary: `${trip.line.startCity} → ${trip.line.endCity}`,
      secondary: `${formatDate(trip.departureTime)} · ${formatShortId(tripId)}`,
    };
  }
  return {
    primary: "Trajet non résolu",
    secondary: formatShortId(tripId),
  };
}

export function formatIncidentUserName(
  user: { firstName: string | null; lastName: string | null; email: string } | null | undefined
): string | null {
  if (!user) return null;
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.email;
}
