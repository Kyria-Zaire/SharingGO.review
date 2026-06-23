import type { PaymentStatus } from "@/types/payments";
import type { ReservationStatus } from "@/types/reservations";

/** Libellés UI — statuts paiement (API Prisma / Stripe). */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  SUCCEEDED: "Payé",
  FAILED: "Échec du paiement",
  REFUNDED: "Remboursé",
};

/** Variantes orthographiques éventuelles côté API. */
const PAYMENT_STATUS_ALIASES: Record<string, string> = {
  CANCELLED: "Annulé",
  CANCELED: "Annulé",
};

/** Libellés UI — statuts réservation. */
export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELED: "Annulée",
  USED: "Utilisée",
  EXPIRED: "Expirée",
};

const RESERVATION_STATUS_ALIASES: Record<string, string> = {
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

/**
 * Libellés UI — statuts embarquement / trajet (référence produit, usage futur).
 * Aligné sur la vision pilote ; pas d'enum brut en interface.
 */
export const BOARDING_STATUS_LABELS = {
  WAITING: "En attente",
  WAITING_PASSENGERS: "En attente des passagers",
  BOARDING: "Embarquement",
  DEPARTED: "Parti",
  COMPLETED: "Terminé",
  READY: "Prêt",
} as const;

export type BoardingStatusLabelKey = keyof typeof BOARDING_STATUS_LABELS;

const UNKNOWN_STATUS_LABEL = "Statut inconnu";

export function getPaymentStatusLabel(status: string | undefined | null): string {
  if (!status) return "—";
  const key = status as PaymentStatus;
  if (key in PAYMENT_STATUS_LABELS) {
    return PAYMENT_STATUS_LABELS[key];
  }
  return PAYMENT_STATUS_ALIASES[status] ?? UNKNOWN_STATUS_LABEL;
}

export function getReservationStatusLabel(status: string): string {
  const key = status as ReservationStatus;
  if (key in RESERVATION_STATUS_LABELS) {
    return RESERVATION_STATUS_LABELS[key];
  }
  return RESERVATION_STATUS_ALIASES[status] ?? UNKNOWN_STATUS_LABEL;
}

export function getBoardingStatusLabel(status: string): string {
  const key = status as BoardingStatusLabelKey;
  if (key in BOARDING_STATUS_LABELS) {
    return BOARDING_STATUS_LABELS[key];
  }
  return UNKNOWN_STATUS_LABEL;
}
