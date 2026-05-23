import { SubscriptionType } from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { getStripeClient } from "../payments/stripe.service.js";
import { assertSubscriptionEligibility } from "./subscriptions.eligibility.js";
import { hasActiveSubscription } from "./subscriptions.service.js";
import type { SubscriptionCheckoutResult } from "./subscriptions.types.js";

function resolveStripePriceId(type: SubscriptionType): string {
  switch (type) {
    case SubscriptionType.MOSOLF_MONTHLY:
      return env.stripePriceMosolfMonthly;
    case SubscriptionType.CONVOYEUR_MONTHLY:
      return env.stripePriceConvoyeurMonthly;
    default:
      throw new AppError("Unsupported subscription type", 400, "VALIDATION_ERROR");
  }
}

export async function createSubscriptionCheckout(
  userId: string,
  type: SubscriptionType
): Promise<SubscriptionCheckoutResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  try {
    assertSubscriptionEligibility(user, type);
  } catch (error) {
    if (error instanceof AppError && error.code === "SUBSCRIPTION_NOT_ELIGIBLE") {
      await writeAuditLog({
        actorUserId: userId,
        action: "SUBSCRIPTION_CHECKOUT_REJECTED_NOT_ELIGIBLE",
        targetType: "Subscription",
        targetId: userId,
        metadata: { subscriptionType: type },
      });
    }
    throw error;
  }

  if (await hasActiveSubscription(userId)) {
    await writeAuditLog({
      actorUserId: userId,
      action: "SUBSCRIPTION_CHECKOUT_REJECTED_ACTIVE",
      targetType: "Subscription",
      targetId: userId,
      metadata: { subscriptionType: type },
    });
    throw new AppError("User already has an active subscription", 409, "SUBSCRIPTION_ALREADY_ACTIVE");
  }

  const existingCustomer = await prisma.subscription.findFirst({
    where: { userId, stripeCustomerId: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { stripeCustomerId: true },
  });

  const stripe = getStripeClient();
  const priceId = resolveStripePriceId(type);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: env.stripeSubscriptionSuccessUrl,
      cancel_url: env.stripeSubscriptionCancelUrl,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        userId,
        subscriptionType: type,
      },
      subscription_data: {
        metadata: {
          userId,
          subscriptionType: type,
        },
      },
      ...(existingCustomer?.stripeCustomerId
        ? { customer: existingCustomer.stripeCustomerId }
        : { customer_email: user.email }),
    });

    if (!session.url) {
      throw new AppError("Failed to create checkout session", 502, "CHECKOUT_CREATE_FAILED");
    }

    await writeAuditLog({
      actorUserId: userId,
      action: "SUBSCRIPTION_CHECKOUT_CREATED",
      targetType: "Subscription",
      targetId: userId,
      metadata: {
        subscriptionType: type,
        stripeCheckoutSessionId: session.id,
      },
    });

    return {
      checkoutUrl: session.url,
      stripeCheckoutSessionId: session.id,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Stripe subscription Checkout Session creation failed", {
      userId,
      subscriptionType: type,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError("Failed to create checkout session", 502, "CHECKOUT_CREATE_FAILED");
  }
}
