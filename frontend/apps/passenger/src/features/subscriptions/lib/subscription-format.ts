import type { Payment } from "@/types/payments";
import type { SafeSubscription, SubscriptionStatus } from "@/types/subscriptions.types";
import { SUBSCRIPTION_CATALOG_PLANS } from "@/features/subscriptions/constants/subscriptions-content";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: "Actif",
  PAST_DUE: "Paiement en attente",
  CANCELED: "Résilié",
  EXPIRED: "Expiré",
  INCOMPLETE: "Incomplet",
};

const TYPE_LABELS = {
  CONVOYEUR_MONTHLY: "Convoyeur Mensuel",
  MOSOLF_MONTHLY: "Mosolf Mensuel",
} as const;

export function formatSubscriptionTypeLabel(type: SafeSubscription["type"]): string {
  return TYPE_LABELS[type];
}

export function formatSubscriptionStatusLabel(status: SubscriptionStatus): string {
  return STATUS_LABELS[status];
}

export function formatSubscriptionDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatSubscriptionPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPaymentAmount(amount: string, currency: string): string {
  const value = Number.parseFloat(amount);
  if (!Number.isFinite(value)) return amount;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function resolvePlanPriceLabel(
  priceMonthly: number,
  billingPeriod: "monthly" | "annual"
): { price: string; period: string } {
  if (billingPeriod === "annual") {
    const annual = Math.round(priceMonthly * 12 * 0.9);
    return { price: formatSubscriptionPrice(annual), period: "/an" };
  }
  return { price: formatSubscriptionPrice(priceMonthly), period: "/mois" };
}

export function inferPlanLabelFromPaymentAmount(amount: string): string {
  const value = Number.parseFloat(amount);
  const mosolf = SUBSCRIPTION_CATALOG_PLANS.find((plan) => plan.id === "mosolf");
  if (mosolf && value >= mosolf.priceMonthly) {
    return TYPE_LABELS.MOSOLF_MONTHLY;
  }
  return TYPE_LABELS.CONVOYEUR_MONTHLY;
}

export function formatPaymentStatusLabel(status: Payment["status"]): string {
  switch (status) {
    case "SUCCEEDED":
      return "Payé";
    case "PENDING":
      return "En attente";
    case "FAILED":
      return "Échoué";
    case "REFUNDED":
      return "Remboursé";
    default:
      return status;
  }
}

export function computeSubscriptionDurationLabel(
  start: string | null,
  end: string
): string {
  if (!start) return "30 jours";
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const days = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));
  return days >= 28 && days <= 31 ? "1 mois" : `${days} jours`;
}
