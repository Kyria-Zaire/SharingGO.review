import type { PaymentStatus, PaymentType, Prisma } from "@prisma/client";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import type { ListPaymentsQuery } from "./payments.schemas.js";
import { serializePaymentWithReservation } from "./payments.serializers.js";
import type { ListPaymentsResult, PaymentDetailDto } from "./payments.types.js";

const paymentListInclude = {
  reservation: {
    include: {
      trip: { include: { line: true } },
    },
  },
} as const;

function warnIfInconsistentPayment(
  payment: { id: string; status: PaymentStatus; reservationId: string | null }
): void {
  if (payment.status === "SUCCEEDED" && !payment.reservationId) {
    logger.warn("Payment SUCCEEDED without linked reservation", { paymentId: payment.id });
  }
}

export async function listUserPayments(
  userId: string,
  query: ListPaymentsQuery
): Promise<ListPaymentsResult> {
  const where: Prisma.PaymentWhereInput = { userId };

  if (query.status) {
    where.status = query.status as PaymentStatus;
  }
  if (query.type) {
    where.type = query.type as PaymentType;
  }

  const payments = await prisma.payment.findMany({
    where,
    include: paymentListInclude,
    orderBy: { createdAt: "desc" },
    take: query.limit,
    skip: query.offset,
  });

  for (const payment of payments) {
    warnIfInconsistentPayment(payment);
  }

  return {
    payments: payments.map(serializePaymentWithReservation),
    limit: query.limit,
    offset: query.offset,
  };
}

export async function getUserPayment(
  userId: string,
  paymentId: string
): Promise<PaymentDetailDto> {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId },
    include: paymentListInclude,
  });

  if (!payment) {
    throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");
  }

  warnIfInconsistentPayment(payment);

  return serializePaymentWithReservation(payment);
}
