/**
 * S2-T8A — Subscription read API tests.
 *
 * Usage (repo root):
 *   node backend/scripts/s2-t8a-subscription-read-api-test.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const password = "DemoPassword123!";

const FORBIDDEN = [
  "stripeSubscriptionId",
  "stripeCustomerId",
  "sub_",
  "cus_",
];

function loadDotEnv() {
  const envPath = join(repoRoot, ".env");
  if (!existsSync(envPath)) return {};
  const vars = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    vars[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return vars;
}

function assertSafe(label, obj) {
  const json = JSON.stringify(obj);
  for (const key of FORBIDDEN) {
    if (json.includes(key)) throw new Error(`${label}: leaked ${key}`);
  }
}

async function login(email) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login ${email}: ${res.status}`);
  return res.headers.get("set-cookie").split(";")[0];
}

async function getSubscriptionMe(cookie) {
  const res = await fetch(`${baseUrl}/api/subscriptions/me`, { headers: { cookie } });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  for (const [k, v] of Object.entries(loadDotEnv())) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  if ((await getSubscriptionMe("")).status !== 401) {
    throw new Error("expected 401 without auth");
  }
  console.log("✓ sans auth → 401");

  const passengerCookie = await login("passenger01@sharinggo.demo");
  const noSub = await getSubscriptionMe(passengerCookie);
  if (noSub.status !== 200) throw new Error(`passenger me: ${noSub.status}`);
  if (noSub.body.subscription !== null || noSub.body.isActive !== false) {
    throw new Error(`passenger expected null/inactive: ${JSON.stringify(noSub.body)}`);
  }
  assertSafe("no subscription", noSub.body);
  console.log("✓ passager sans abonnement → null, isActive=false");

  const mosolfActive = await getSubscriptionMe(await login("mosolf-active@sharinggo.demo"));
  if (mosolfActive.body.isActive !== true) throw new Error("mosolf-active should be active");
  if (mosolfActive.body.subscription?.type !== "MOSOLF_MONTHLY") {
    throw new Error("expected MOSOLF_MONTHLY");
  }
  if (mosolfActive.body.subscription?.status !== "ACTIVE") {
    throw new Error("expected ACTIVE status");
  }
  assertSafe("mosolf-active", mosolfActive.body);
  console.log("✓ mosolf-active → isActive=true");

  const mosolfExpired = await getSubscriptionMe(await login("mosolf-expired@sharinggo.demo"));
  if (mosolfExpired.body.isActive !== false) throw new Error("mosolf-expired should be inactive");
  if (!mosolfExpired.body.subscription) throw new Error("mosolf-expired should return subscription");
  assertSafe("mosolf-expired", mosolfExpired.body);
  console.log("✓ mosolf-expired → isActive=false");

  const convoyeurMonthly = await getSubscriptionMe(
    await login("convoyeur-monthly@sharinggo.demo")
  );
  if (convoyeurMonthly.body.isActive !== true) throw new Error("convoyeur-monthly should be active");
  if (convoyeurMonthly.body.subscription?.type !== "CONVOYEUR_MONTHLY") {
    throw new Error("expected CONVOYEUR_MONTHLY");
  }
  assertSafe("convoyeur-monthly", convoyeurMonthly.body);
  console.log("✓ convoyeur-monthly → isActive=true");

  const openapi = readFileSync(
    join(repoRoot, "backend", "src", "docs", "openapi.json"),
    "utf8"
  );
  if (!openapi.includes("/api/subscriptions/me")) {
    throw new Error("OpenAPI missing /api/subscriptions/me");
  }
  console.log("✓ OpenAPI documents subscriptions/me");

  console.log("\nS2-T8A subscription read API tests OK");
}

main().catch((e) => {
  console.error("S2-T8A FAILED:", e.message);
  process.exit(1);
});
