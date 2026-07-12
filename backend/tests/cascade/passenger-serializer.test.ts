import { describe, expect, it } from "vitest";
import { RefundStatus, ReservationStatus } from "@prisma/client";
import { testPrisma } from "../helpers/db.js";
import { serializeReservationListItem } from "../../src/modules/reservations/reservations.serializers.js";

async function seedCanceledPendingRefund() {
  const pax = await testPrisma.user.create({
    data: { email: `p${Date.now()}@t.test`, firstName: "P", lastName: "X", userType: "CONVOYEUR" },
  });
  const line = await testPrisma.line.create({
    data: { name: "Châlons ↔ Vatry", startCity: "Châlons-en-Champagne", endCity: "Paris-Vatry" },
  });
  const trip = await testPrisma.trip.create({
    data: { lineId: line.id, departureTime: new Date(Date.now() + 86400000) },
  });
  const reservation = await testPrisma.reservation.create({
    data: {
      tripId: trip.id,
      userId: pax.id,
      status: ReservationStatus.CANCELED,
      refundStatus: RefundStatus.PENDING,
    },
  });
  const full = await testPrisma.reservation.findUniqueOrThrow({
    where: { id: reservation.id },
    include: { trip: { include: { line: true } }, payment: true },
  });
  return full;
}

describe("serializeReservationListItem (passenger)", () => {
  it("exposes refundStatus for a canceled reservation pending refund", async () => {
    const reservation = await seedCanceledPendingRefund();

    const view = serializeReservationListItem(reservation);

    expect(view.status).toBe(ReservationStatus.CANCELED);
    expect(view.refundStatus).toBe(RefundStatus.PENDING);
  });
});
