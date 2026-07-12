import { describe, expect, it } from "vitest";
import { CreditStatus, PaymentStatus, RefundStatus, ReservationStatus } from "@prisma/client";
import { testPrisma } from "../helpers/db.js";
import { creditReservation } from "../../src/modules/admin/admin-reservations.service.js";

async function seedPendingRefund() {
  const admin = await testPrisma.user.create({
    data: { email: `a${Date.now()}@t.test`, firstName: "A", lastName: "D", userType: "ADMIN" },
  });
  const pax = await testPrisma.user.create({
    data: { email: `p${Date.now()}@t.test`, firstName: "P", lastName: "X", userType: "CONVOYEUR" },
  });
  const line = await testPrisma.line.create({ data: { name: "Châlons ↔ Vatry", startCity: "Châlons-en-Champagne", endCity: "Paris-Vatry" } });
  const trip = await testPrisma.trip.create({ data: { lineId: line.id, departureTime: new Date(Date.now() + 86400000) } });
  const reservation = await testPrisma.reservation.create({
    data: { tripId: trip.id, userId: pax.id, status: ReservationStatus.CANCELED, refundStatus: RefundStatus.PENDING },
  });
  await testPrisma.payment.create({
    data: {
      userId: pax.id, reservationId: reservation.id, stripePaymentIntentId: `pi_${Date.now()}`,
      amount: "18.00", status: PaymentStatus.SUCCEEDED, type: "TICKET",
    },
  });
  return { admin, pax, reservation };
}

describe("creditReservation", () => {
  it("creates a credit and sets CREDITED with amount from payment", async () => {
    const { admin, pax, reservation } = await seedPendingRefund();
    await creditReservation(reservation.id, admin.id);

    const updated = await testPrisma.reservation.findUniqueOrThrow({ where: { id: reservation.id } });
    expect(updated.refundStatus).toBe(RefundStatus.CREDITED);
    expect(updated.refundProcessedByUserId).toBe(admin.id);

    const credit = await testPrisma.credit.findUniqueOrThrow({ where: { sourceReservationId: reservation.id } });
    expect(credit.userId).toBe(pax.id);
    expect(credit.status).toBe(CreditStatus.AVAILABLE);
    expect(credit.amount.toString()).toBe("18");
    expect(credit.expiresAt).toBeNull();
  });

  it("rejects with 409 when not PENDING", async () => {
    const { admin, reservation } = await seedPendingRefund();
    await testPrisma.reservation.update({ where: { id: reservation.id }, data: { refundStatus: RefundStatus.CREDITED } });
    await expect(creditReservation(reservation.id, admin.id)).rejects.toMatchObject({
      statusCode: 409, code: "REFUND_NOT_PENDING",
    });
  });
});
