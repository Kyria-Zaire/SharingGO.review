/** Placeholder status labels for future admin tables (F3-T2+). */
export const RESERVATION_STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  USED: "Utilisée",
  CANCELED: "Annulée",
  EXPIRED: "Expirée",
} as const;

export const PAYMENT_TYPE_LABELS = {
  TICKET: "Ticket",
  SUBSCRIPTION_ACCESS: "Accès abonnement",
  SUBSCRIPTION: "Abonnement",
} as const;

export const PAYMENT_STATUS_LABELS = {
  PENDING: "En attente",
  SUCCEEDED: "Réussi",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
} as const;

export const SUBSCRIPTION_STATUS_LABELS = {
  ACTIVE: "Actif",
  EXPIRED: "Expiré",
  CANCELED: "Annulé",
  PAST_DUE: "Impayé",
} as const;

export type ReservationStatusKey = keyof typeof RESERVATION_STATUS_LABELS;
export type PaymentStatusKey = keyof typeof PAYMENT_STATUS_LABELS;
export type SubscriptionStatusKey = keyof typeof SUBSCRIPTION_STATUS_LABELS;
