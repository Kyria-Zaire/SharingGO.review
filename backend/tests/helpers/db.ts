import { PrismaClient } from "@prisma/client";

export const testPrisma = new PrismaClient();

// Ordre inverse des dépendances FK. `RESTART IDENTITY CASCADE` vide tout proprement.
// NOTE(cascade-01 task-1): "Credit" retiré de la liste — la table n'existe pas encore,
// elle est créée en Task 2. À réintégrer quand la migration Credit sera appliquée.
const TABLES = [
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
