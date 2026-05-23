import { SubscriptionStatus, type Subscription } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { serializeSafeSubscription } from "./subscriptions.serializers.js";
import type { SubscriptionMeResponse } from "./subscriptions.types.js";

/** V1 active rule: ACTIVE status and period end in the future (Stripe-aligned). */
export function isSubscriptionActive(subscription: Subscription, now = new Date()): boolean {
  return (
    subscription.status === SubscriptionStatus.ACTIVE &&
    subscription.currentPeriodEnd > now
  );
}

/** Most recent ACTIVE subscription with a future `currentPeriodEnd`, if any. */
export async function getActiveSubscriptionForUser(
  userId: string,
  now = new Date()
): Promise<Subscription | null> {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const active = await getActiveSubscriptionForUser(userId);
  return active !== null;
}

/** Owner read model for GET /api/subscriptions/me (S2-T8A). */
export async function getSubscriptionMe(userId: string): Promise<SubscriptionMeResponse> {
  const active = await getActiveSubscriptionForUser(userId);
  if (active) {
    return {
      subscription: serializeSafeSubscription(active),
      isActive: true,
    };
  }

  const latest = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (latest) {
    return {
      subscription: serializeSafeSubscription(latest),
      isActive: false,
    };
  }

  return { subscription: null, isActive: false };
}
