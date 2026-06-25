import type { ReservationStatus } from "@/types/reservations";

export type BoardingPassBadgeKind = "valid" | "used" | "canceled" | "expired";

export interface BoardingPassBadgeView {
  kind: BoardingPassBadgeKind;
  label: string;
}

export interface BoardingPassReadinessView {
  title: string;
  subtitle: string;
}

/** Badge header — Valide / Utilisé / Annulé / Expiré (spec CTO). */
export function resolveBoardingPassBadge(
  status: string,
  options: {
    isPastTrip: boolean;
    isQrExpired: boolean;
    hasBoardingError: boolean;
  }
): BoardingPassBadgeView {
  const normalized = status as ReservationStatus;

  if (normalized === "CANCELED") {
    return { kind: "canceled", label: "Annulé" };
  }

  if (normalized === "USED" || (normalized === "CONFIRMED" && options.isPastTrip)) {
    return { kind: "used", label: "Utilisé" };
  }

  if (normalized === "EXPIRED" || options.isQrExpired || options.hasBoardingError) {
    return { kind: "expired", label: "Expiré" };
  }

  if (normalized === "CONFIRMED") {
    return { kind: "valid", label: "Valide" };
  }

  return { kind: "expired", label: "Expiré" };
}

export function resolveBoardingPassReadiness(
  badge: BoardingPassBadgeView,
  validDateLabel: string
): BoardingPassReadinessView {
  switch (badge.kind) {
    case "valid":
      return {
        title: "Prêt à embarquer",
        subtitle: `${validDateLabel}`,
      };
    case "used":
      return {
        title: "Trajet terminé",
        subtitle: "Ce billet a déjà été utilisé.",
      };
    case "canceled":
      return {
        title: "Réservation annulée",
        subtitle: "Ce billet n'est plus valide.",
      };
    case "expired":
    default:
      return {
        title: "Billet expiré",
        subtitle: "La fenêtre d'embarquement est terminée.",
      };
  }
}
