import {
  getPaymentStatusLabel,
  getReservationStatusLabel,
  RESERVATION_STATUS_LABELS,
} from "@/constants/status-labels";
import type { BadgeVariant } from "@/types/ui.types";
import type { RefundStatus, ReservationStatus } from "@/types/reservations";

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

/** Libellé refund-aware pour une réservation CANCELED (spec §8.2, 3 états). */
function refundAwareCanceledLabel(refundStatus: RefundStatus | undefined): string {
  switch (refundStatus) {
    case "REFUNDED":
      return "Remboursé";
    case "CREDITED":
      return "Avoir crédité sur votre compte";
    case "PENDING":
      return "Trajet annulé — remboursement en cours de traitement";
    case "NONE":
    case undefined:
    default:
      return "Trajet annulé";
  }
}

const CANCELED_REFUND_BADGE_VARIANTS: Record<RefundStatus, BadgeVariant> = {
  NONE: "destructive",
  PENDING: "warning",
  REFUNDED: "muted",
  CREDITED: "muted",
};

export function getReservationStatusView(
  status: string,
  refundStatus?: RefundStatus
): ReservationStatusView {
  const key = status as ReservationStatus;

  if (key === "CANCELED") {
    return {
      label: refundAwareCanceledLabel(refundStatus),
      badgeVariant: refundStatus ? CANCELED_REFUND_BADGE_VARIANTS[refundStatus] : "destructive",
    };
  }

  const badgeVariant = STATUS_BADGE_VARIANTS[key] ?? "default";
  const label =
    key in RESERVATION_STATUS_LABELS
      ? RESERVATION_STATUS_LABELS[key]
      : getReservationStatusLabel(status);
  return { label, badgeVariant };
}

export { getPaymentStatusLabel };

export function formatPaymentAmount(amount: string, currency: string): string {
  const value = Number.parseFloat(amount);
  if (currency.toLowerCase() === "eur") {
    return Number.isNaN(value) ? amount : `${value.toFixed(2).replace(".", ",")} €`;
  }
  return `${amount} ${currency.toUpperCase()}`;
}
