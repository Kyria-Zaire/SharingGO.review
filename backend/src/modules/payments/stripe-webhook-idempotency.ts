import type { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { writeAuditLog } from "../../lib/audit-log.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";

export const STRIPE_WEBHOOK_PROVIDER = "stripe" as const;

export async function isStripeWebhookEventProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.webhookEvent.findUnique({
    where: {
      provider_eventId: {
        provider: STRIPE_WEBHOOK_PROVIDER,
        eventId,
      },
    },
  });
  return existing !== null;
}

export async function recordStripeWebhookEventInTx(
  tx: Prisma.TransactionClient,
  event: Stripe.Event
): Promise<void> {
  await tx.webhookEvent.create({
    data: {
      provider: STRIPE_WEBHOOK_PROVIDER,
      eventId: event.id,
      eventType: event.type,
    },
  });
}

export async function recordStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  await prisma.webhookEvent.create({
    data: {
      provider: STRIPE_WEBHOOK_PROVIDER,
      eventId: event.id,
      eventType: event.type,
    },
  });
}

export async function ignoreDuplicateStripeWebhook(event: Stripe.Event): Promise<boolean> {
  if (!(await isStripeWebhookEventProcessed(event.id))) {
    return false;
  }
  logger.debug("Stripe webhook duplicate ignored", {
    eventId: event.id,
    eventType: event.type,
  });
  await writeAuditLog({
    actorUserId: null,
    action: "SUBSCRIPTION_WEBHOOK_IGNORED",
    targetType: "WebhookEvent",
    targetId: event.id,
    metadata: { eventType: event.type, reason: "duplicate" },
  });
  return true;
}
