import { PaymentStatus, PaymentType, Prisma } from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { getStripeClient } from "./stripe.service.js";
import type { CreateCheckoutResult } from "./payments.types.js";

const TICKET_AMOUNT_EUR = new Prisma.Decimal("8.00");

async function auditPayment(
  action: string,
  actorUserId: string,
  targetId: string,
  metadata?: Prisma.InputJsonValue
): Promise<void> {
  await writeAuditLog({
    actorUserId,
    action,
    targetType: "Payment",
    targetId,
    metadata,
  });
}

async function loadPendingForCheckout(pendingReservationId: string, userId: string) {
  const now = new Date();
  const pending = await prisma.pendingReservation.findUnique({
    where: { id: pendingReservationId },
    include: {
      trip: { include: { line: true } },
    },
  });

  if (!pending) {
    throw new AppError("Pending reservation not found", 404, "PENDING_NOT_FOUND");
  }

  if (pending.userId !== userId) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  if (pending.consumedAt) {
    throw new AppError("Pending reservation already consumed", 409, "PENDING_ALREADY_CONSUMED");
  }

  if (pending.expiresAt <= now) {
    throw new AppError("Pending reservation has expired", 410, "PENDING_EXPIRED");
  }

  if (pending.trip.deletedAt) {
    throw new AppError("Trip is not available", 400, "TRIP_DISABLED");
  }

  if (pending.trip.departureTime <= now) {
    throw new AppError("Trip has already departed", 400, "TRIP_PAST");
  }

  return pending;
}

export async function createCheckoutSession(
  userId: string,
  pendingReservationId: string
): Promise<CreateCheckoutResult> {
  const pending = await loadPendingForCheckout(pendingReservationId, userId);
  const stripe = getStripeClient();

  const openPayments = await prisma.payment.findMany({
    where: {
      userId,
      status: PaymentStatus.PENDING,
      type: PaymentType.TICKET,
      reservationId: null,
      stripeCheckoutSessionId: { not: null },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  for (const existing of openPayments) {
    if (!existing.stripeCheckoutSessionId) continue;
    try {
      const session = await stripe.checkout.sessions.retrieve(existing.stripeCheckoutSessionId);
      if (
        session.metadata?.pendingReservationId === pendingReservationId &&
        session.status === "open" &&
        session.url
      ) {
        return {
          checkoutUrl: session.url,
          stripeCheckoutSessionId: session.id,
        };
      }
    } catch {
      // Session invalid in Stripe — continue to create a new one
    }
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: pendingReservationId,
      success_url: env.stripeSuccessUrl,
      cancel_url: env.stripeCancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: env.stripeCurrency,
            unit_amount: env.stripeTicketPriceCents,
            product_data: {
              name: `Sharing Go — ${pending.trip.line.name}`,
              description: `${pending.trip.line.startCity} → ${pending.trip.line.endCity}`,
            },
          },
        },
      ],
      metadata: {
        pendingReservationId,
        userId,
        tripId: pending.tripId,
      },
    });
  } catch (error) {
    logger.error("Stripe Checkout Session creation failed", {
      userId,
      pendingReservationId,
      error: error instanceof Error ? error.message : String(error),
    });
    await auditPayment("CHECKOUT_CREATE_FAILED", userId, pendingReservationId, {
      pendingReservationId,
    });
    throw new AppError("Failed to create checkout session", 502, "CHECKOUT_CREATE_FAILED");
  }

  if (!session.url) {
    throw new AppError("Failed to create checkout session", 502, "CHECKOUT_CREATE_FAILED");
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await prisma.payment.create({
    data: {
      userId,
      amount: TICKET_AMOUNT_EUR,
      currency: env.stripeCurrency,
      status: PaymentStatus.PENDING,
      type: PaymentType.TICKET,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
    },
  });

  await auditPayment("CHECKOUT_CREATED", userId, session.id, {
    pendingReservationId,
    tripId: pending.tripId,
    stripeCheckoutSessionId: session.id,
  });

  return {
    checkoutUrl: session.url,
    stripeCheckoutSessionId: session.id,
  };
}
