import {
  PaymentStatus,
  PaymentType,
  Prisma,
  ReservationStatus,
} from "@prisma/client";
import type Stripe from "stripe";
import { writeAuditLog } from "../../lib/audit-log.js";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { countOccupiedSeats, deleteExpiredPendingForTrip } from "../../lib/trip-occupancy.js";
import { prisma } from "../../lib/prisma.js";
import { lockTripForUpdate } from "../reservations/reservation-locking.js";
import type { StripeCheckoutMetadata } from "./payments.types.js";

const TICKET_AMOUNT_EUR = new Prisma.Decimal("8.00");
const STRIPE_PROVIDER = "stripe";

async function auditPaymentFlow(
  action: string,
  actorUserId: string | undefined,
  targetId: string,
  metadata?: Prisma.InputJsonValue
): Promise<void> {
  await writeAuditLog({
    actorUserId: actorUserId ?? null,
    action,
    targetType: "Payment",
    targetId,
    metadata,
  });
}

function parseCheckoutMetadata(session: Stripe.Checkout.Session): StripeCheckoutMetadata {
  const pendingReservationId = session.metadata?.pendingReservationId;
  const userId = session.metadata?.userId;
  const tripId = session.metadata?.tripId;

  if (!pendingReservationId || !userId || !tripId) {
    throw new AppError("Invalid Stripe session metadata", 400, "WEBHOOK_METADATA_INVALID");
  }

  return { pendingReservationId, userId, tripId };
}

async function markPaymentFailedInTx(
  tx: Prisma.TransactionClient,
  stripeCheckoutSessionId: string
): Promise<void> {
  await tx.payment.updateMany({
    where: {
      stripeCheckoutSessionId,
      status: PaymentStatus.PENDING,
    },
    data: { status: PaymentStatus.FAILED },
  });
}

async function recordWebhookProcessedInTx(
  tx: Prisma.TransactionClient,
  event: Stripe.Event
): Promise<void> {
  await tx.webhookEvent.create({
    data: {
      provider: STRIPE_PROVIDER,
      eventId: event.id,
      eventType: event.type,
    },
  });
}

export async function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  if (event.type !== "checkout.session.completed") {
    return;
  }

  const existingEvent = await prisma.webhookEvent.findUnique({
    where: {
      provider_eventId: {
        provider: STRIPE_PROVIDER,
        eventId: event.id,
      },
    },
  });

  if (existingEvent) {
    logger.info("Stripe webhook duplicate ignored", { eventId: event.id, eventType: event.type });
    await auditPaymentFlow("STRIPE_WEBHOOK_DUPLICATE", undefined, event.id, {
      eventType: event.type,
    });
    return;
  }

  await auditPaymentFlow("STRIPE_WEBHOOK_RECEIVED", undefined, event.id, {
    eventType: event.type,
  });

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = parseCheckoutMetadata(session);
  const now = new Date();

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const existingSucceeded = await prisma.payment.findFirst({
    where: {
      stripeCheckoutSessionId: session.id,
      status: PaymentStatus.SUCCEEDED,
    },
    include: { reservation: true },
  });

  if (existingSucceeded?.reservation) {
    await prisma.webhookEvent.create({
      data: {
        provider: STRIPE_PROVIDER,
        eventId: event.id,
        eventType: event.type,
      },
    });
    logger.info("Checkout session already fulfilled", {
      sessionId: session.id,
      reservationId: existingSucceeded.reservation.id,
    });
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const trip = await lockTripForUpdate(tx, metadata.tripId);
      if (!trip || trip.deletedAt) {
        throw new AppError("Trip not found", 404, "TRIP_NOT_FOUND");
      }

      await deleteExpiredPendingForTrip(tx, metadata.tripId, now);

      const pending = await tx.pendingReservation.findFirst({
        where: {
          id: metadata.pendingReservationId,
          userId: metadata.userId,
          tripId: metadata.tripId,
        },
      });

      if (!pending) {
        throw new AppError("Pending reservation not found", 404, "PENDING_NOT_FOUND");
      }

      if (pending.consumedAt) {
        logger.warn("Webhook received for already consumed pending", {
          pendingReservationId: pending.id,
          eventId: event.id,
        });
        await recordWebhookProcessedInTx(tx, event);
        return;
      }

      if (pending.expiresAt <= now) {
        await markPaymentFailedInTx(tx, session.id);
        await auditPaymentFlow("PAYMENT_REJECTED_PENDING_EXPIRED", metadata.userId, session.id, {
          pendingReservationId: pending.id,
          eventId: event.id,
        });
        logger.warn("Payment rejected: pending expired at webhook", {
          pendingReservationId: pending.id,
          eventId: event.id,
        });
        await recordWebhookProcessedInTx(tx, event);
        return;
      }

      const occupied = await countOccupiedSeats(tx, metadata.tripId, now);
      if (occupied > trip.totalSeats) {
        await markPaymentFailedInTx(tx, session.id);
        logger.warn("Payment rejected: trip over capacity at webhook", {
          tripId: metadata.tripId,
          occupied,
          totalSeats: trip.totalSeats,
        });
        await recordWebhookProcessedInTx(tx, event);
        return;
      }

      const reservation = await tx.reservation.create({
        data: {
          tripId: metadata.tripId,
          userId: metadata.userId,
          status: ReservationStatus.CONFIRMED,
          boardingToken: null,
        },
      });

      const pendingPayment = await tx.payment.findFirst({
        where: { stripeCheckoutSessionId: session.id },
      });

      if (pendingPayment) {
        let resolvedPaymentIntentId =
          paymentIntentId ?? pendingPayment.stripePaymentIntentId;
        if (resolvedPaymentIntentId) {
          const intentClash = await tx.payment.findFirst({
            where: {
              stripePaymentIntentId: resolvedPaymentIntentId,
              id: { not: pendingPayment.id },
            },
          });
          if (intentClash) {
            resolvedPaymentIntentId = pendingPayment.stripePaymentIntentId;
          }
        }

        await tx.payment.update({
          where: { id: pendingPayment.id },
          data: {
            status: PaymentStatus.SUCCEEDED,
            reservationId: reservation.id,
            stripePaymentIntentId: resolvedPaymentIntentId,
            amount: TICKET_AMOUNT_EUR,
            currency: "eur",
            type: PaymentType.TICKET,
          },
        });
      } else {
        await tx.payment.create({
          data: {
            userId: metadata.userId,
            reservationId: reservation.id,
            amount: TICKET_AMOUNT_EUR,
            currency: "eur",
            status: PaymentStatus.SUCCEEDED,
            type: PaymentType.TICKET,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
          },
        });
      }

      await tx.pendingReservation.update({
        where: { id: pending.id },
        data: { consumedAt: now },
      });

      await recordWebhookProcessedInTx(tx, event);

      await writeAuditLog({
        actorUserId: metadata.userId,
        action: "RESERVATION_CONFIRMED",
        targetType: "Reservation",
        targetId: reservation.id,
        metadata: { tripId: metadata.tripId, pendingReservationId: pending.id },
      });

      await writeAuditLog({
        actorUserId: metadata.userId,
        action: "PAYMENT_SUCCEEDED",
        targetType: "Payment",
        targetId: reservation.id,
        metadata: { stripeCheckoutSessionId: session.id },
      });
    });
  } catch (error) {
    if (error instanceof AppError && error.code === "PENDING_NOT_FOUND") {
      await markPaymentFailedBySessionGlobal(session.id);
      try {
        await prisma.webhookEvent.create({
          data: {
            provider: STRIPE_PROVIDER,
            eventId: event.id,
            eventType: event.type,
          },
        });
      } catch (recordError) {
        if (
          !(
            recordError instanceof Prisma.PrismaClientKnownRequestError &&
            recordError.code === "P2002"
          )
        ) {
          throw recordError;
        }
      }
      logger.warn("Webhook: pending not found", { eventId: event.id });
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      logger.info("Webhook event race resolved as duplicate", { eventId: event.id });
      return;
    }
    throw error;
  }
}

async function markPaymentFailedBySessionGlobal(stripeCheckoutSessionId: string): Promise<void> {
  await prisma.payment.updateMany({
    where: {
      stripeCheckoutSessionId,
      status: PaymentStatus.PENDING,
    },
    data: { status: PaymentStatus.FAILED },
  });
}
