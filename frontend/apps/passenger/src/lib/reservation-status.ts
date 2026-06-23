import {
  getPaymentStatusLabel,
  getReservationStatusLabel,
  RESERVATION_STATUS_LABELS,
} from "@/constants/status-labels";
import type { BadgeVariant } from "@/types/ui.types";
import type { ReservationStatus } from "@/types/reservations";

export interface ReservationStatusView {
  label: string;
  badgeVariant: BadgeVariant;
}

const STATUS_BADGE_VARIANTS: Record<ReservationStatus, BadgeVariant> = {
  CONFIRMED: "success",
  USED: "muted",
  CANCELED: "destructive",
  PENDING: "warning",
  EXPIRED: "muted",
};

export function getReservationStatusView(status: string): ReservationStatusView {
  const key = status as ReservationStatus;
  const badgeVariant = STATUS_BADGE_VARIANTS[key] ?? "default";
  const label =
    key in RESERVATION_STATUS_LABELS
      ? RESERVATION_STATUS_LABELS[key]
      : getReservationStatusLabel(status);
  return { label, badgeVariant };
}

export { getPaymentStatusLabel, getReservationStatusLabel };

export function formatPaymentAmount(amount: string, currency: string): string {
  const value = Number.parseFloat(amount);
  if (currency.toLowerCase() === "eur") {
    return Number.isNaN(value) ? amount : `${value.toFixed(2).replace(".", ",")} €`;
  }
  return `${amount} ${currency.toUpperCase()}`;
}
