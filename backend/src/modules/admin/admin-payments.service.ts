import { PaymentStatus, PaymentType, type Prisma } from "@prisma/client";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { serializeAdminPayment } from "./admin.serializers.js";
import type { ListAdminPaymentsQuery } from "./admin.schemas.js";
import type { ListAdminPaymentsResult } from "./admin.types.js";

const paymentInclude = {
  user: true,
  reservation: {
    include: {
      trip: { include: { line: true } },
    },
  },
} as const;

function buildWhere(query: ListAdminPaymentsQuery): Prisma.PaymentWhereInput {
  const where: Prisma.PaymentWhereInput = {};

  if (query.status) where.status = query.status as PaymentStatus;
  if (query.type) where.type = query.type as PaymentType;
  if (query.userId) where.userId = query.userId;
  if (query.reservationId) where.reservationId = query.reservationId;

  const createdAt: Prisma.DateTimeFilter = {};
  if (query.from) createdAt.gte = new Date(query.from);
  if (query.to) createdAt.lte = new Date(query.to);
  if (query.from || query.to) where.createdAt = createdAt;

  return where;
}

export async function listAdminPayments(
  query: ListAdminPaymentsQuery
): Promise<ListAdminPaymentsResult> {
  const payments = await prisma.payment.findMany({
    where: buildWhere(query),
    include: paymentInclude,
    orderBy: { createdAt: "desc" },
    take: query.limit,
    skip: query.offset,
  });

  for (const payment of payments) {
    if (payment.status === "SUCCEEDED" && !payment.reservationId) {
      logger.warn("Admin view: payment SUCCEEDED without reservation", {
        paymentId: payment.id,
      });
    }
  }

  return {
    payments: payments.map(serializeAdminPayment),
    limit: query.limit,
    offset: query.offset,
  };
}
