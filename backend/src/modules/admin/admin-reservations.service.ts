import { CreditStatus, PaymentStatus, RefundStatus, ReservationStatus, type Prisma } from "@prisma/client";
import { AppError } from "../../lib/errors.js";
import { writeAuditLog } from "../../lib/audit-log.js";
import { writeCascadeAuditLog } from "../../lib/cascade-audit-log.js";
import { prisma } from "../../lib/prisma.js";
import { getStripeClient } from "../payments/stripe.service.js";
import { serializeAdminReservation } from "./admin.serializers.js";
import type { ListAdminReservationsQuery } from "./admin.schemas.js";
import type { ListAdminReservationsResult } from "./admin.types.js";

const reservationInclude = {
  user: true,
  trip: { include: { line: true } },
  payment: true,
  refundProcessedBy: true,
} as const;

function buildWhere(query: ListAdminReservationsQuery): Prisma.ReservationWhereInput {
  const where: Prisma.ReservationWhereInput = {};

  if (query.status) {
    where.status = query.status as ReservationStatus;
  }
  if (query.userId) {
    where.userId = query.userId;
  }
  if (query.tripId) {
    where.tripId = query.tripId;
  }
  if (query.refundStatus) {
    where.refundStatus = query.refundStatus;
  }

  const tripFilter: Prisma.TripWhereInput = {};
  if (query.lineId) tripFilter.lineId = query.lineId;
  const departureTime: Prisma.DateTimeFilter = {};
  if (query.from) departureTime.gte = new Date(query.from);
  if (query.to) departureTime.lte = new Date(query.to);
  if (query.from || query.to) tripFilter.departureTime = departureTime;
  if (Object.keys(tripFilter).length > 0) {
    where.trip = tripFilter;
  }

  return where;
}

export async function listAdminReservations(
  query: ListAdminReservationsQuery
): Promise<ListAdminReservationsResult> {
  const reservations = await prisma.reservation.findMany({
    where: buildWhere(query),
    include: reservationInclude,
    orderBy: { createdAt: "desc" },
    take: query.limit,
    skip: query.offset,
  });

  return {
    reservations: reservations.map(serializeAdminReservation),
    limit: query.limit,
    offset: query.offset,
  };
}

export async function getAdminReservation(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: reservationInclude,
  });

  if (!reservation) {
    throw new AppError("Reservation not found", 404, "RESERVATION_NOT_FOUND");
  }

  return serializeAdminReservation(reservation);
}

export async function cancelAdminReservation(
  reservationId: string,
  actorUserId: string,
  reason?: string
) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: reservationInclude,
  });

  if (!reservation) {
    throw new AppError("Reservation not found", 404, "RESERVATION_NOT_FOUND");
  }

  if (reservation.status === ReservationStatus.CANCELED) {
    throw new AppError("Reservation is already canceled", 409, "RESERVATION_ALREADY_CANCELED");
  }

  if (reservation.status === ReservationStatus.USED) {
    throw new AppError("Cannot cancel a used reservation", 409, "RESERVATION_ALREADY_USED");
  }

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: ReservationStatus.CANCELED },
    include: reservationInclude,
  });

  await writeAuditLog({
    actorUserId,
    action: "RESERVATION_CANCELLED",
    targetType: "Reservation",
    targetId: reservationId,
    metadata: reason ? { reason } : undefined,
  });

  return serializeAdminReservation(updated);
}

export async function refundReservation(reservationId: string, actorUserId: string) {
  // Étape A — tx courte : verrou pessimiste + garde d'état.
  const guard = await prisma.$transaction(async (tx) => {
    // FOR UPDATE sérialise les requêtes concurrentes sur cette ligne.
    const rows = await tx.$queryRaw<Array<{ id: string; refundStatus: RefundStatus }>>`
      SELECT id, "refundStatus" FROM "Reservation" WHERE id = ${reservationId} FOR UPDATE
    `;
    const row = rows[0];
    if (!row) throw new AppError("Reservation not found", 404, "RESERVATION_NOT_FOUND");
    if (row.refundStatus !== RefundStatus.PENDING) {
      throw new AppError("Reservation is not pending refund", 409, "REFUND_NOT_PENDING");
    }
    const payment = await tx.payment.findUnique({ where: { reservationId } });
    if (!payment?.stripePaymentIntentId) {
      throw new AppError("No payment intent to refund", 422, "NO_PAYMENT_INTENT");
    }
    return { paymentIntentId: payment.stripePaymentIntentId };
  });

  // Étape B — HORS transaction : appel Stripe idempotent.
  try {
    await getStripeClient().refunds.create(
      { payment_intent: guard.paymentIntentId },
      { idempotencyKey: `refund_${reservationId}` }
    );
  } catch {
    throw new AppError("Stripe refund failed", 502, "STRIPE_REFUND_FAILED");
  }

  // Étape C — tx courte : commit REFUNDED + payment + audit.
  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservationId },
      data: {
        refundStatus: RefundStatus.REFUNDED,
        refundProcessedAt: new Date(),
        refundProcessedByUserId: actorUserId,
      },
    });
    await tx.payment.updateMany({
      where: { reservationId },
      data: { status: PaymentStatus.REFUNDED },
    });
    await writeCascadeAuditLog(tx, {
      actorUserId,
      action: "RESERVATION_REFUNDED",
      targetType: "Reservation",
      targetId: reservationId,
      metadata: { paymentIntentId: guard.paymentIntentId },
    });
  });

  const updated = await prisma.reservation.findUniqueOrThrow({
    where: { id: reservationId },
    include: reservationInclude,
  });
  return serializeAdminReservation(updated);
}

export async function creditReservation(reservationId: string, actorUserId: string) {
  const updated = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ id: string; refundStatus: RefundStatus }>>`
      SELECT id, "refundStatus" FROM "Reservation" WHERE id = ${reservationId} FOR UPDATE
    `;
    const row = rows[0];
    if (!row) throw new AppError("Reservation not found", 404, "RESERVATION_NOT_FOUND");
    if (row.refundStatus !== RefundStatus.PENDING) {
      throw new AppError("Reservation is not pending refund", 409, "REFUND_NOT_PENDING");
    }

    const payment = await tx.payment.findUnique({ where: { reservationId } });
    if (!payment) throw new AppError("No payment to credit", 422, "NO_PAYMENT_INTENT");

    const reservation = await tx.reservation.findUniqueOrThrow({ where: { id: reservationId } });

    const credit = await tx.credit.create({
      data: {
        userId: reservation.userId,
        sourceReservationId: reservationId,
        amount: payment.amount,
        status: CreditStatus.AVAILABLE,
        // expiresAt laissé null (décision V1)
      },
    });

    await tx.reservation.update({
      where: { id: reservationId },
      data: {
        refundStatus: RefundStatus.CREDITED,
        refundProcessedAt: new Date(),
        refundProcessedByUserId: actorUserId,
      },
    });

    await writeCascadeAuditLog(tx, {
      actorUserId,
      action: "RESERVATION_CREDITED",
      targetType: "Reservation",
      targetId: reservationId,
      metadata: { creditId: credit.id, amount: payment.amount.toString() },
    });

    return tx.reservation.findUniqueOrThrow({ where: { id: reservationId }, include: reservationInclude });
  });

  return serializeAdminReservation(updated);
}
