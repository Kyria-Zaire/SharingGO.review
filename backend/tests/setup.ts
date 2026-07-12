import { config } from "dotenv";
import { afterAll, beforeEach } from "vitest";
import { resetDb, testPrisma } from "./helpers/db.js";

// Charger .env.test AVANT toute connexion Prisma.
config({ path: ".env.test" });

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});
