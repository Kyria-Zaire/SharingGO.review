import type { Prisma, Trip } from "@prisma/client";

/** Locks a trip row with PostgreSQL `FOR UPDATE` inside an open transaction. */
export async function lockTripForUpdate(
  tx: Prisma.TransactionClient,
  tripId: string
): Promise<Trip | null> {
  const rows = await tx.$queryRaw<Trip[]>`
    SELECT
      id,
      "lineId",
      "driverId",
      "departureTime",
      "arrivalTime",
      "totalSeats",
      "createdAt",
      "updatedAt",
      "deletedAt"
    FROM "Trip"
    WHERE id = ${tripId}
    FOR UPDATE
  `;

  return rows[0] ?? null;
}
