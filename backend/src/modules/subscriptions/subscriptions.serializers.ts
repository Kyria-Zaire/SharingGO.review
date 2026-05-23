import type { Subscription } from "@prisma/client";
import type { SafeSubscriptionDto } from "./subscriptions.types.js";

export function serializeSafeSubscription(subscription: Subscription): SafeSubscriptionDto {
  return {
    id: subscription.id,
    type: subscription.type,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
    currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
    createdAt: subscription.createdAt.toISOString(),
  };
}
