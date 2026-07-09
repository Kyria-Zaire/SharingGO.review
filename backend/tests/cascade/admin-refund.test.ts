import { describe, expect, it, vi, beforeEach } from "vitest";
import { PaymentStatus, RefundStatus, ReservationStatus } from "@prisma/client";
import { testPrisma } from "../helpers/db.js";

// Mock du client Stripe AVANT import du service.
const refundsCreate = vi.fn(async () => ({ id: "re_test_123", status: "succeeded" }));
vi.mock("../../src/modules/payments/stripe.service.js", () => ({
  getStripeClient: () => ({ refunds: { create: refundsCreate } }),
}));

const { refundReservation } = await import("../../src/modules/admin/admin-reservations.service.js");

async function seedPendingRefund() {
  const admin = await testPrisma.user.create({
    data: { email: `a${Date.now()}@t.test`, firstName: "A", lastName: "D", userType: "ADMIN" },
  });
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
    data: { tripId: trip.id, userId: pax.id, status: ReservationStatus.CANCELED, refundStatus: RefundStatus.PENDING },
  });
  await testPrisma.payment.create({
    data: {
      userId: pax.id, reservationId: reservation.id,
      stripePaymentIntentId: `pi_${Date.now()}`, amount: "18.00",
      status: PaymentStatus.SUCCEEDED, type: "TICKET",
    },
  });
  return { admin, reservation };
}

describe("refundReservation", () => {
  beforeEach(() => refundsCreate.mockClear());

  it("refunds via Stripe once with deterministic idempotency key and sets REFUNDED", async () => {
    const { admin, reservation } = await seedPendingRefund();
    await refundReservation(reservation.id, admin.id);

    expect(refundsCreate).toHaveBeenCalledTimes(1);
    const [, opts] = refundsCreate.mock.calls[0];
    expect(opts).toMatchObject({ idempotencyKey: `refund_${reservation.id}` });

    const updated = await testPrisma.reservation.findUniqueOrThrow({ where: { id: reservation.id } });
    expect(updated.refundStatus).toBe(RefundStatus.REFUNDED);
    expect(updated.refundProcessedByUserId).toBe(admin.id);

    const payment = await testPrisma.payment.findFirstOrThrow({ where: { reservationId: reservation.id } });
    expect(payment.status).toBe(PaymentStatus.REFUNDED);
  });

  it("rejects with 409 when not PENDING", async () => {
    const { admin, reservation } = await seedPendingRefund();
    await testPrisma.reservation.update({ where: { id: reservation.id }, data: { refundStatus: RefundStatus.REFUNDED } });
    await expect(refundReservation(reservation.id, admin.id)).rejects.toMatchObject({
      statusCode: 409, code: "REFUND_NOT_PENDING",
    });
    expect(refundsCreate).not.toHaveBeenCalled();
  });

  it("rejects with 422 when no payment intent", async () => {
    const { admin, reservation } = await seedPendingRefund();
    await testPrisma.payment.deleteMany({ where: { reservationId: reservation.id } });
    await expect(refundReservation(reservation.id, admin.id)).rejects.toMatchObject({
      statusCode: 422, code: "NO_PAYMENT_INTENT",
    });
    expect(refundsCreate).not.toHaveBeenCalled();
  });

  it("returns 502 and keeps PENDING when Stripe fails", async () => {
    const { admin, reservation } = await seedPendingRefund();
    refundsCreate.mockRejectedValueOnce(new Error("stripe down"));
    await expect(refundReservation(reservation.id, admin.id)).rejects.toMatchObject({
      statusCode: 502, code: "STRIPE_REFUND_FAILED",
    });
    const updated = await testPrisma.reservation.findUniqueOrThrow({ where: { id: reservation.id } });
    expect(updated.refundStatus).toBe(RefundStatus.PENDING);
    const payment = await testPrisma.payment.findFirstOrThrow({ where: { reservationId: reservation.id } });
    expect(payment.status).toBe(PaymentStatus.SUCCEEDED);
  });
});
