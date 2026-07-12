import { describe, expect, it } from "vitest";
import { RefundStatus, ReservationStatus } from "@prisma/client";
import { testPrisma } from "../helpers/db.js";
import { listAdminReservations } from "../../src/modules/admin/admin-reservations.service.js";

describe("listAdminReservations refundStatus filter", () => {
  it("returns only PENDING when filtered", async () => {
    const pax = await testPrisma.user.create({
      data: { email: `p${Date.now()}@t.test`, firstName: "P", lastName: "X", userType: "CONVOYEUR" },
    });
    const line = await testPrisma.line.create({ data: { name: "Châlons ↔ Vatry", startCity: "Châlons-en-Champagne", endCity: "Paris-Vatry" } });
    const trip = await testPrisma.trip.create({ data: { lineId: line.id, departureTime: new Date(Date.now() + 86400000) } });

    await testPrisma.reservation.create({
      data: { tripId: trip.id, userId: pax.id, status: ReservationStatus.CANCELED, refundStatus: RefundStatus.PENDING },
    });
    await testPrisma.reservation.create({
      data: { tripId: trip.id, userId: pax.id, status: ReservationStatus.CONFIRMED, refundStatus: RefundStatus.NONE },
    });

    const result = await listAdminReservations({ refundStatus: RefundStatus.PENDING, limit: 50, offset: 0 } as never);
    expect(result.reservations).toHaveLength(1);
    expect(result.reservations[0].refundStatus).toBe(RefundStatus.PENDING);
  });
});
