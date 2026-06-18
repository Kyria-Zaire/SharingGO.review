import type { PublicTrip, TripAvailabilityView } from "@/types/trips.types";

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

export function deriveTripAvailability(trip: PublicTrip, now = new Date()): TripAvailabilityView {
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

  if (trip.isFull || trip.remainingSeats <= 0) {
    return {
      status: "full",
      label: STATUS_LABELS.full,
      ctaLabel: STATUS_LABELS.full,
      ctaDisabled: true,
    };
  }

  if (trip.remainingSeats <= 2) {
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

export function canNavigateToTripDetail(status: TripAvailabilityView["status"]): boolean {
  return status === "available" || status === "almost_full";
}

export interface TripDetailReservationCta {
  label: string;
  disabled: boolean;
  showComingSoon: boolean;
}

export function deriveTripDetailReservationCta(trip: PublicTrip, now = new Date()): TripDetailReservationCta {
  const availability = deriveTripAvailability(trip, now);

  if (availability.status === "available" || availability.status === "almost_full") {
    return {
      label: DETAIL_RESERVATION_LABELS[availability.status],
      disabled: false,
      showComingSoon: true,
    };
  }

  return {
    label: DETAIL_RESERVATION_LABELS[availability.status],
    disabled: true,
    showComingSoon: false,
  };
}

export function sortTripsByDeparture(trips: PublicTrip[]): PublicTrip[] {
  return [...trips].sort(
    (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
  );
}
