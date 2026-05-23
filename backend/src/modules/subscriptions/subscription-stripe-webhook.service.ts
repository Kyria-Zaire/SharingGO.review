import { Prisma, SubscriptionStatus } from "@prisma/client";
import type Stripe from "stripe";
import { writeAuditLog } from "../../lib/audit-log.js";
import { stripeLogRef } from "../../lib/stripe-log-refs.js";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import {
  ignoreDuplicateStripeWebhook,
  recordStripeWebhookEvent,
  recordStripeWebhookEventInTx,
} from "../payments/stripe-webhook-idempotency.js";
import { getStripeClient } from "../payments/stripe.service.js";
import {
  mapStripeSubscriptionStatus,
  parseSubscriptionTypeFromMetadata,
  stripePeriodToDates,
} from "./subscription-stripe.mapper.js";
import { getActiveSubscriptionForUser } from "./subscriptions.service.js";

async function warnIfAnotherActiveSubscription(
  userId: string,
  stripeSubscriptionId: string
): Promise<void> {
  const otherActive = await getActiveSubscriptionForUser(userId);
  if (otherActive && otherActive.stripeSubscriptionId !== stripeSubscriptionId) {
    logger.warn("User has another active subscription record", {
      userId,
      existingSubscriptionId: otherActive.id,
      incomingStripeSubscriptionRef: stripeLogRef(stripeSubscriptionId),
    });
  }
}

async function upsertSubscriptionFromStripe(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    type: ReturnType<typeof parseSubscriptionTypeFromMetadata>;
    stripeSubscriptionId: string;
    stripeCustomerId: string | null;
    status: SubscriptionStatus;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date;
    canceledAt?: Date | null;
  }
): Promise<void> {
  const existing = await tx.subscription.findUnique({
    where: { stripeSubscriptionId: input.stripeSubscriptionId },
  });

  if (existing) {
    await tx.subscription.update({
      where: { id: existing.id },
      data: {
        status: input.status,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
        stripeCustomerId: input.stripeCustomerId ?? existing.stripeCustomerId,
        canceledAt: input.canceledAt ?? null,
      },
    });
    return;
  }

  await tx.subscription.create({
    data: {
      userId: input.userId,
      type: input.type,
      status: input.status,
      stripeSubscriptionId: input.stripeSubscriptionId,
      stripeCustomerId: input.stripeCustomerId,
      currentPeriodStart: input.currentPeriodStart,
      currentPeriodEnd: input.currentPeriodEnd,
      canceledAt: input.canceledAt ?? null,
    },
  });
}

async function loadStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return getStripeClient().subscriptions.retrieve(subscriptionId);
}

export async function handleSubscriptionCheckoutSessionCompleted(
  event: Stripe.Event,
  session: Stripe.Checkout.Session
): Promise<void> {
  if (await ignoreDuplicateStripeWebhook(event)) {
    return;
  }

  const userId = session.metadata?.userId;
  if (!userId) {
    throw new AppError("Invalid Stripe session metadata", 400, "WEBHOOK_METADATA_INVALID");
  }

  const subscriptionType = parseSubscriptionTypeFromMetadata(session.metadata);
  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  if (!stripeSubscriptionId) {
    throw new AppError("Missing Stripe subscription id", 400, "WEBHOOK_METADATA_INVALID");
  }

  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

  const stripeSubscription = await loadStripeSubscription(stripeSubscriptionId);
  const { currentPeriodStart, currentPeriodEnd } = stripePeriodToDates(stripeSubscription);
  const status = mapStripeSubscriptionStatus(stripeSubscription.status);

  await prisma.$transaction(async (tx) => {
    await warnIfAnotherActiveSubscription(userId, stripeSubscriptionId);
    await upsertSubscriptionFromStripe(tx, {
      userId,
      type: subscriptionType,
      stripeSubscriptionId,
      stripeCustomerId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
    });
    await recordStripeWebhookEventInTx(tx, event);
  });

  await writeAuditLog({
    actorUserId: userId,
    action: "SUBSCRIPTION_ACTIVATED",
    targetType: "Subscription",
    targetId: stripeSubscriptionId,
    metadata: {
      subscriptionType,
      eventId: event.id,
      status,
    },
  });
}

export async function handleStripeSubscriptionLifecycleEvent(
  event: Stripe.Event,
  subscription: Stripe.Subscription
): Promise<void> {
  if (await ignoreDuplicateStripeWebhook(event)) {
    return;
  }

  const stripeSubscriptionId = subscription.id;
  const userId = subscription.metadata?.userId;
  const { currentPeriodStart, currentPeriodEnd } = stripePeriodToDates(subscription);
  const status = mapStripeSubscriptionStatus(subscription.status);
  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;

  const canceledAt =
    event.type === "customer.subscription.deleted" || subscription.status === "canceled"
      ? new Date()
      : null;

  if (!userId) {
    const byStripeId = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });
    if (!byStripeId) {
      logger.warn("Stripe subscription webhook without user metadata", {
        eventId: event.id,
        stripeSubscriptionRef: stripeLogRef(stripeSubscriptionId),
      });
      await recordStripeWebhookEvent(event);
      return;
    }

    await prisma.$transaction(async (tx) => {
      await upsertSubscriptionFromStripe(tx, {
        userId: byStripeId.userId,
        type: byStripeId.type,
        stripeSubscriptionId,
        stripeCustomerId,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        canceledAt,
      });
      await recordStripeWebhookEventInTx(tx, event);
    });

    await writeAuditLog({
      actorUserId: byStripeId.userId,
      action:
        event.type === "customer.subscription.deleted"
          ? "SUBSCRIPTION_CANCELED"
          : "SUBSCRIPTION_UPDATED",
      targetType: "Subscription",
      targetId: byStripeId.id,
      metadata: { eventId: event.id, status },
    });
    return;
  }

  let subscriptionType;
  try {
    subscriptionType = parseSubscriptionTypeFromMetadata(subscription.metadata);
  } catch {
    const existing = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });
    if (!existing) {
      logger.warn("Stripe subscription webhook missing type metadata", {
        eventId: event.id,
        userId,
      });
      await recordStripeWebhookEvent(event);
      return;
    }
    subscriptionType = existing.type;
  }

  await prisma.$transaction(async (tx) => {
    await warnIfAnotherActiveSubscription(userId, stripeSubscriptionId);
    await upsertSubscriptionFromStripe(tx, {
      userId,
      type: subscriptionType,
      stripeSubscriptionId,
      stripeCustomerId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      canceledAt,
    });
    await recordStripeWebhookEventInTx(tx, event);
  });

  const auditAction =
    event.type === "customer.subscription.deleted"
      ? "SUBSCRIPTION_CANCELED"
      : event.type === "customer.subscription.created"
        ? "SUBSCRIPTION_ACTIVATED"
        : "SUBSCRIPTION_UPDATED";

  await writeAuditLog({
    actorUserId: userId,
    action: auditAction,
    targetType: "Subscription",
    targetId: stripeSubscriptionId,
    metadata: { eventId: event.id, status },
  });
}
