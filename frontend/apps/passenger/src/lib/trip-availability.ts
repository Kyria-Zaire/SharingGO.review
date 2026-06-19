import type { PublicTrip, TripAvailabilityView } from "@/types/trips.types";

/** Places restantes ≤ seuil → badge « Bientôt complet » (CDC V1 : 8 places max). */
export const ALMOST_FULL_REMAINING_THRESHOLD = 2;

/** Places réservées ≥ ce seuil (sur 8) → badge « Bientôt complet » (= total − seuil restant). */
export function almostFullReservedThreshold(totalSeats: number): number {
  return Math.max(0, totalSeats - ALMOST_FULL_REMAINING_THRESHOLD);
}

const STATUS_LABELS = {
  available: "Disponible",
  almost_full: "Bientôt complet",
  full: "Complet",
  unavailable: "Indisponible",
  past: "Passé",
} as const;

const LIST_CARD_CTA_LABEL = "Voir le trajet";

const DETAIL_RESERVATION_LABELS = {
  available: "Réserver ma place",
  almost_full: "Réserver ma place",
  full: "Complet",
  unavailable: "Indisponible",
  past: "Trajet passé",
} as const;

export interface NormalizedTripSeats {
  totalSeats: number;
  reservedSeats: number;
  remainingSeats: number;
  isFull: boolean;
}

/**
 * Normalise les compteurs places à partir de totalSeats / reservedSeats (source métier).
 * Corrige les écarts éventuels entre champs API (remainingSeats, isFull).
 */
export function normalizeTripSeats(trip: PublicTrip): NormalizedTripSeats {
  const totalSeats = Math.max(0, trip.totalSeats);
  const reservedSeats = Math.min(Math.max(0, trip.reservedSeats), totalSeats);
  const remainingSeats = Math.max(0, totalSeats - reservedSeats);
  const isFull = remainingSeats <= 0;

  return { totalSeats, reservedSeats, remainingSeats, isFull };
}

export function deriveTripAvailability(trip: PublicTrip, now = new Date()): TripAvailabilityView {
  const { reservedSeats, isFull, totalSeats } = normalizeTripSeats(trip);
  const departure = new Date(trip.departureTime);

  if (trip.isDisabled) {
    return {
      status: "unavailable",
      label: STATUS_LABELS.unavailable,
      ctaLabel: STATUS_LABELS.unavailable,
      ctaDisabled: true,
    };
  }

  if (departure.getTime() < now.getTime()) {
    return {
      status: "past",
      label: STATUS_LABELS.past,
      ctaLabel: STATUS_LABELS.past,
      ctaDisabled: true,
    };
  }

  if (isFull || trip.isFull) {
    return {
      status: "full",
      label: STATUS_LABELS.full,
      ctaLabel: STATUS_LABELS.full,
      ctaDisabled: true,
    };
  }

  if (reservedSeats >= almostFullReservedThreshold(totalSeats)) {
    return {
      status: "almost_full",
      label: STATUS_LABELS.almost_full,
      ctaLabel: LIST_CARD_CTA_LABEL,
      ctaDisabled: false,
    };
  }

  return {
    status: "available",
    label: STATUS_LABELS.available,
    ctaLabel: LIST_CARD_CTA_LABEL,
    ctaDisabled: false,
  };
}

export function isTripBookable(availability: TripAvailabilityView): boolean {
  return !availability.ctaDisabled;
}

/** @deprecated Prefer isTripBookable(deriveTripAvailability(trip)) */
export function canNavigateToTripDetail(status: TripAvailabilityView["status"]): boolean {
  return status === "available" || status === "almost_full";
}

export interface TripDetailReservationCta {
  label: string;
  disabled: boolean;
}

export function deriveTripDetailReservationCta(trip: PublicTrip, now = new Date()): TripDetailReservationCta {
  const availability = deriveTripAvailability(trip, now);

  if (isTripBookable(availability)) {
    return {
      label: DETAIL_RESERVATION_LABELS[availability.status],
      disabled: false,
    };
  }

  return {
    label: DETAIL_RESERVATION_LABELS[availability.status],
    disabled: true,
  };
}

/** Libellé liste /trips : X = places déjà réservées (occupation), pas restantes. */
export function formatReservedSeatsLabel(reservedSeats: number, totalSeats: number): string {
  if (reservedSeats <= 0) {
    return `0 place réservée sur ${totalSeats}`;
  }
  if (reservedSeats === 1) {
    return `1 place réservée sur ${totalSeats}`;
  }
  if (reservedSeats >= totalSeats) {
    return `${totalSeats} places réservées sur ${totalSeats}`;
  }
  return `${reservedSeats} places réservées sur ${totalSeats}`;
}

export function formatRemainingSeatsLabel(remainingSeats: number, totalSeats: number): string {
  if (remainingSeats <= 0) {
    return `0 place restante sur ${totalSeats}`;
  }
  if (remainingSeats === 1) {
    return `1 place restante sur ${totalSeats}`;
  }
  return `${remainingSeats} places restantes sur ${totalSeats}`;
}

export function sortTripsByDeparture(trips: PublicTrip[]): PublicTrip[] {
  return [...trips].sort(
    (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
  );
}
