import type { BadgeVariant } from "@/types/ui.types";
import type { ReservationStatus } from "@/types/reservations";

export interface ReservationStatusView {
  label: string;
  badgeVariant: BadgeVariant;
}

const STATUS_VIEWS: Record<ReservationStatus, ReservationStatusView> = {
  CONFIRMED: { label: "Confirmée", badgeVariant: "success" },
  USED: { label: "Utilisée", badgeVariant: "muted" },
  CANCELED: { label: "Annulée", badgeVariant: "destructive" },
  PENDING: { label: "En attente", badgeVariant: "warning" },
  EXPIRED: { label: "Expirée", badgeVariant: "muted" },
};

export function getReservationStatusView(status: string): ReservationStatusView {
  const key = status as ReservationStatus;
  return STATUS_VIEWS[key] ?? { label: status, badgeVariant: "default" };
}

export function formatPaymentAmount(amount: string, currency: string): string {
  const value = Number.parseFloat(amount);
  if (currency.toLowerCase() === "eur") {
    return Number.isNaN(value) ? amount : `${value.toFixed(2).replace(".", ",")} €`;
  }
  return `${amount} ${currency.toUpperCase()}`;
}
