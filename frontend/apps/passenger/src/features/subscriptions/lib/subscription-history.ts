import type { Payment } from "@/types/payments";
import type { SubscriptionMeResponse } from "@/types/subscriptions.types";
import {
  computeSubscriptionDurationLabel,
  formatPaymentAmount,
  formatPaymentStatusLabel,
  formatSubscriptionDate,
  formatSubscriptionStatusLabel,
  formatSubscriptionTypeLabel,
  inferPlanLabelFromPaymentAmount,
} from "@/features/subscriptions/lib/subscription-format";

export interface SubscriptionHistoryItem {
  id: string;
  label: string;
  dateLabel: string;
  priceLabel: string;
  durationLabel: string;
  statusLabel: string;
}

function fromPayment(payment: Payment): SubscriptionHistoryItem {
  return {
    id: payment.id,
    label: inferPlanLabelFromPaymentAmount(payment.amount),
    dateLabel: formatSubscriptionDate(payment.createdAt),
    priceLabel: formatPaymentAmount(payment.amount, payment.currency),
    durationLabel: "1 mois",
    statusLabel: formatPaymentStatusLabel(payment.status),
  };
}

function fromInactiveSubscription(
  subscription: NonNullable<SubscriptionMeResponse["subscription"]>
): SubscriptionHistoryItem {
  return {
    id: subscription.id,
    label: formatSubscriptionTypeLabel(subscription.type),
    dateLabel: formatSubscriptionDate(subscription.createdAt),
    priceLabel: "—",
    durationLabel: computeSubscriptionDurationLabel(
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd
    ),
    statusLabel: formatSubscriptionStatusLabel(subscription.status),
  };
}

/** Historique dérivé des paiements API ; repli sur le dernier abonnement inactif si besoin. */
export function buildSubscriptionHistoryItems(
  payments: Payment[],
  me: SubscriptionMeResponse | undefined
): SubscriptionHistoryItem[] {
  const subscriptionPayments = payments.filter((payment) => payment.type === "SUBSCRIPTION");
  if (subscriptionPayments.length > 0) {
    return subscriptionPayments.map(fromPayment);
  }

  if (me?.subscription && !me.isActive) {
    return [fromInactiveSubscription(me.subscription)];
  }

  return [];
}
