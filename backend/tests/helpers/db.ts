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

// Garde-fou anti-catastrophe : `dotenv.config()` dans tests/setup.ts ne surcharge PAS un
// DATABASE_URL déjà exporté dans l'environnement (CI, shell dev). Sans cette garde, `npm test`
// pourrait TRUNCATE la base de dev/prod au lieu de sharinggo_test — inacceptable sur un projet
// qui manipule de vrais paiements.
function assertTestDatabase(): void {
  const url = process.env.DATABASE_URL ?? "";
  // Extrait le nom de la base (dernier segment de chemin, sans query string).
  const dbName = url.split("/").pop()?.split("?")[0] ?? "";
  if (!dbName.endsWith("_test")) {
    throw new Error(
      `resetDb() refused: DATABASE_URL points to "${dbName}", which does not end in "_test". ` +
        `Refusing to TRUNCATE a non-test database. Set DATABASE_URL to a *_test database in .env.test.`
    );
  }
}

export async function resetDb(): Promise<void> {
  assertTestDatabase();
  const list = TABLES.map((t) => `"${t}"`).join(", ");
  await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE;`);
}
