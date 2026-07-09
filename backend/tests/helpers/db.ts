import { PrismaClient } from "@prisma/client";

export const testPrisma = new PrismaClient();

// Ordre inverse des dépendances FK. `RESTART IDENTITY CASCADE` vide tout proprement.
const TABLES = [
  "Credit",
  "Payment",
  "Reservation",
  "PendingReservation",
  "AuditLog",
  "WebhookEvent",
  "Trip",
  "Subscription",
  "Line",
  "OAuthAccount",
  "User",
];

export async function resetDb(): Promise<void> {
  const list = TABLES.map((t) => `"${t}"`).join(", ");
  await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE;`);
}
