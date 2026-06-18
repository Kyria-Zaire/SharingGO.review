import type { PublicTrip, TripAvailabilityView } from "@/types/trips.types";

const STATUS_LABELS = {
  available: "Disponible",
  almost_full: "Bientôt complet",
  full: "Complet",
  unavailable: "Indisponible",
  past: "Passé",
} as const;

const CTA_LABELS = {
  available: "Réserver bientôt",
  almost_full: "Réserver bientôt",
  full: "Complet",
  unavailable: "Indisponible",
  past: "Passé",
} as const;

export function deriveTripAvailability(trip: PublicTrip, now = new Date()): TripAvailabilityView {
  const departure = new Date(trip.departureTime);

  if (trip.isDisabled) {
    return {
      status: "unavailable",
      label: STATUS_LABELS.unavailable,
      ctaLabel: CTA_LABELS.unavailable,
      ctaDisabled: true,
    };
  }

  if (departure.getTime() < now.getTime()) {
    return {
      status: "past",
      label: STATUS_LABELS.past,
      ctaLabel: CTA_LABELS.past,
      ctaDisabled: true,
    };
  }

  if (trip.isFull || trip.remainingSeats <= 0) {
    return {
      status: "full",
      label: STATUS_LABELS.full,
      ctaLabel: CTA_LABELS.full,
      ctaDisabled: true,
    };
  }

  if (trip.remainingSeats <= 2) {
    return {
      status: "almost_full",
      label: STATUS_LABELS.almost_full,
      ctaLabel: CTA_LABELS.almost_full,
      ctaDisabled: true,
    };
  }

  return {
    status: "available",
    label: STATUS_LABELS.available,
    ctaLabel: CTA_LABELS.available,
    ctaDisabled: true,
  };
}

export function sortTripsByDeparture(trips: PublicTrip[]): PublicTrip[] {
  return [...trips].sort(
    (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
  );
}
