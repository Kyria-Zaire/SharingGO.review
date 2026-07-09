import { describe, expect, it, vi } from "vitest";
import { PaymentStatus, RefundStatus, ReservationStatus, TripLifecycleStatus } from "@prisma/client";
import { testPrisma } from "../helpers/db.js";
import { cancelTrip } from "../../src/modules/trips/trip-lifecycle.service.js";
import * as stripeService from "../../src/modules/payments/stripe.service.js";

// Helpers de seed — adapter aux champs réels des modèles.
async function seedTripWithReservations() {
  const admin = await testPrisma.user.create({
    data: { email: `a${Date.now()}@t.test`, firstName: "A", lastName: "D", userType: "ADMIN" },
  });
  const paxPaid = await testPrisma.user.create({
    data: { email: `p${Date.now()}@t.test`, firstName: "P", lastName: "Paid", userType: "CONVOYEUR" },
  });
  const paxUnpaid = await testPrisma.user.create({
    data: { email: `u${Date.now()}@t.test`, firstName: "U", lastName: "Unpaid", userType: "CONVOYEUR" },
  });
  const line = await testPrisma.line.create({
    data: { name: "Châlons ↔ Vatry", startCity: "Châlons-en-Champagne", endCity: "Paris-Vatry" },
  });
  const trip = await testPrisma.trip.create({
    data: { lineId: line.id, departureTime: new Date(Date.now() + 86400000) },
  });
  const rPaid = await testPrisma.reservation.create({
    data: { tripId: trip.id, userId: paxPaid.id, status: ReservationStatus.CONFIRMED },
  });
  await testPrisma.payment.create({
    data: {
      userId: paxPaid.id,
      reservationId: rPaid.id,
      stripePaymentIntentId: `pi_${Date.now()}`,
      amount: "18.00",
      status: PaymentStatus.SUCCEEDED,
      type: "TICKET",
    },
  });
  const rUnpaid = await testPrisma.reservation.create({
    data: { tripId: trip.id, userId: paxUnpaid.id, status: ReservationStatus.PENDING },
  });
  return { admin, trip, rPaid, rUnpaid };
}

describe("cancelTrip cascade", () => {
  it("cancels reservations and flags paid ones PENDING, unpaid NONE", async () => {
    const { admin, trip, rPaid, rUnpaid } = await seedTripWithReservations();

    await cancelTrip(trip.id, { reason: "weather" }, admin.id);

    const updatedTrip = await testPrisma.trip.findUniqueOrThrow({ where: { id: trip.id } });
    expect(updatedTrip.lifecycleStatus).toBe(TripLifecycleStatus.CANCELLED);

    const paid = await testPrisma.reservation.findUniqueOrThrow({ where: { id: rPaid.id } });
    expect(paid.status).toBe(ReservationStatus.CANCELED);
    expect(paid.refundStatus).toBe(RefundStatus.PENDING);

    const unpaid = await testPrisma.reservation.findUniqueOrThrow({ where: { id: rUnpaid.id } });
    expect(unpaid.status).toBe(ReservationStatus.CANCELED);
    expect(unpaid.refundStatus).toBe(RefundStatus.NONE);
  });

  it("writes one audit log per impacted reservation plus one for the trip", async () => {
    const { admin, trip } = await seedTripWithReservations();
    await cancelTrip(trip.id, { reason: "weather" }, admin.id);

    const resLogs = await testPrisma.auditLog.count({
      where: { action: "RESERVATION_CANCELLED_BY_TRIP", targetType: "Reservation" },
    });
    const tripLogs = await testPrisma.auditLog.count({
      where: { action: "TRIP_CANCELLED", targetType: "Trip", targetId: trip.id },
    });
    expect(resLogs).toBe(2);
    expect(tripLogs).toBe(1);
  });

  it("does not trigger any Stripe call on cancellation", async () => {
    const stripeSpy = vi.fn();
    // getStripeClient ne doit pas être invoqué par la cascade.
    const getStripeClientSpy = vi.spyOn(stripeService, "getStripeClient");
    const { admin, trip } = await seedTripWithReservations();
    await cancelTrip(trip.id, { reason: "weather" }, admin.id);
    expect(stripeSpy).not.toHaveBeenCalled();
    // Renforcement (au-delà du brief) : le point d'intégration Stripe réel n'est jamais sollicité.
    expect(getStripeClientSpy).not.toHaveBeenCalled();
    getStripeClientSpy.mockRestore();
  });

  it("rejects double cancellation with 409 and does not re-cascade", async () => {
    const { admin, trip, rPaid } = await seedTripWithReservations();
    await cancelTrip(trip.id, { reason: "weather" }, admin.id);
    await expect(cancelTrip(trip.id, { reason: "again" }, admin.id)).rejects.toMatchObject({
      statusCode: 409,
      code: "INVALID_LIFECYCLE_TRANSITION",
    });
    // refundStatus inchangé après le 2e appel refusé
    const paid = await testPrisma.reservation.findUniqueOrThrow({ where: { id: rPaid.id } });
    expect(paid.refundStatus).toBe(RefundStatus.PENDING);
  });
});
