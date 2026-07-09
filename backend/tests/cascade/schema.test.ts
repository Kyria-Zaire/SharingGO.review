import { describe, expect, it } from "vitest";
import { RefundStatus, CreditStatus } from "@prisma/client";
import { testPrisma } from "../helpers/db.js";

describe("cascade-01 schema", () => {
  it("exposes RefundStatus and CreditStatus enums", () => {
    expect(RefundStatus.NONE).toBe("NONE");
    expect(RefundStatus.PENDING).toBe("PENDING");
    expect(RefundStatus.REFUNDED).toBe("REFUNDED");
    expect(RefundStatus.CREDITED).toBe("CREDITED");
    expect(CreditStatus.AVAILABLE).toBe("AVAILABLE");
    expect(CreditStatus.USED).toBe("USED");
  });

  it("defaults reservation.refundStatus to NONE", async () => {
    const user = await testPrisma.user.create({
      data: { email: "t@sharinggo.test", firstName: "T", lastName: "U", userType: "CONVOYEUR" },
    });
    const line = await testPrisma.line.create({
      data: { name: "Châlons ↔ Vatry", startCity: "Châlons-en-Champagne", endCity: "Paris-Vatry" },
    });
    const trip = await testPrisma.trip.create({
      data: { lineId: line.id, departureTime: new Date(Date.now() + 86400000) },
    });
    const reservation = await testPrisma.reservation.create({
      data: { tripId: trip.id, userId: user.id },
    });
    expect(reservation.refundStatus).toBe(RefundStatus.NONE);
  });

  it("enforces one credit per source reservation (unique)", async () => {
    const user = await testPrisma.user.create({
      data: { email: "c@sharinggo.test", firstName: "C", lastName: "U", userType: "CONVOYEUR" },
    });
    const line = await testPrisma.line.create({
      data: { name: "Châlons ↔ Vatry", startCity: "Châlons-en-Champagne", endCity: "Paris-Vatry" },
    });
    const trip = await testPrisma.trip.create({
      data: { lineId: line.id, departureTime: new Date(Date.now() + 86400000) },
    });
    const reservation = await testPrisma.reservation.create({
      data: { tripId: trip.id, userId: user.id },
    });
    await testPrisma.credit.create({
      data: { userId: user.id, sourceReservationId: reservation.id, amount: "18.00" },
    });
    await expect(
      testPrisma.credit.create({
        data: { userId: user.id, sourceReservationId: reservation.id, amount: "18.00" },
      })
    ).rejects.toThrow();
  });
});
