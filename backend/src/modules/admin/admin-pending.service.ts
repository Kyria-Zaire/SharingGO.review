import type { Prisma } from "@prisma/client";
import { serializeAdminPending } from "./admin.serializers.js";
import { prisma } from "../../lib/prisma.js";
import type { ListAdminPendingQuery } from "./admin.schemas.js";
import type { ListAdminPendingResult } from "./admin.types.js";

const pendingInclude = {
  user: true,
  trip: { include: { line: true } },
} as const;

function buildPendingWhere(query: ListAdminPendingQuery, now: Date): Prisma.PendingReservationWhereInput {
  const where: Prisma.PendingReservationWhereInput = {};

  if (query.userId) where.userId = query.userId;
  if (query.tripId) where.tripId = query.tripId;

  const includeConsumed = query.includeConsumed === true;
  const filterActive = query.active === true;
  const filterExpired = query.expired === true;

  if (filterActive || filterExpired) {
    where.consumedAt = null;
    if (filterActive && !filterExpired) {
      where.expiresAt = { gt: now };
    } else if (filterExpired && !filterActive) {
      where.expiresAt = { lte: now };
    }
  } else if (!includeConsumed) {
    where.consumedAt = null;
  }

  return where;
}

export async function listAdminPendingReservations(
  query: ListAdminPendingQuery
): Promise<ListAdminPendingResult> {
  const now = new Date();
  const pending = await prisma.pendingReservation.findMany({
    where: buildPendingWhere(query, now),
    include: pendingInclude,
    orderBy: { createdAt: "desc" },
    take: query.limit,
    skip: query.offset,
  });

  return {
    pendingReservations: pending.map((row) => serializeAdminPending(row, now)),
    limit: query.limit,
    offset: query.offset,
  };
}
