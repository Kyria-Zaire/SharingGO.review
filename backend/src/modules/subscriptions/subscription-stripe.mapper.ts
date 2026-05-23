import { SubscriptionStatus, SubscriptionType } from "@prisma/client";
import type Stripe from "stripe";
import { AppError } from "../../lib/errors.js";

export function mapStripeSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): SubscriptionStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return SubscriptionStatus.ACTIVE;
    case "past_due":
    case "unpaid":
    case "paused":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
      return SubscriptionStatus.CANCELED;
    case "incomplete":
      return SubscriptionStatus.INCOMPLETE;
    case "incomplete_expired":
      return SubscriptionStatus.EXPIRED;
    default:
      return SubscriptionStatus.INCOMPLETE;
  }
}

export function parseSubscriptionTypeFromMetadata(
  metadata: Stripe.Metadata | null | undefined
): SubscriptionType {
  const raw = metadata?.subscriptionType;
  if (raw === SubscriptionType.MOSOLF_MONTHLY || raw === SubscriptionType.CONVOYEUR_MONTHLY) {
    return raw;
  }
  throw new AppError("Invalid subscription metadata", 400, "WEBHOOK_METADATA_INVALID");
}

type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start?: number;
  current_period_end?: number;
};

export function stripePeriodToDates(subscription: Stripe.Subscription): {
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date;
} {
  const sub = subscription as StripeSubscriptionWithPeriod;
  const start = sub.current_period_start;
  const end = sub.current_period_end;
  if (typeof end !== "number") {
    throw new AppError("Missing subscription period end", 400, "WEBHOOK_METADATA_INVALID");
  }
  return {
    currentPeriodStart: typeof start === "number" ? new Date(start * 1000) : null,
    currentPeriodEnd: new Date(end * 1000),
  };
}
