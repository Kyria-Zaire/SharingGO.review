/**
 * S1-T4 — Preuves E2E Stripe (CTO checklist avant commit).
 *
 * Prérequis :
 *   1. .env : STRIPE_SECRET_KEY réel (sk_test_…), pas de placeholder
 *   2. Terminal A : stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *   3. .env : STRIPE_WEBHOOK_SECRET = whsec_… affiché par stripe listen
 *   4. docker compose -f docker-compose.dev.yml restart backend
 *
 * Usage (depuis repo root) :
 *   node backend/scripts/s1-t4-stripe-e2e.mjs
 *   BASE_URL=http://localhost:3000 TRIP_ID=xxx node backend/scripts/s1-t4-stripe-e2e.mjs
 */

import { execFileSync, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const Stripe = require(join(dirname(fileURLToPath(import.meta.url)), "..", "node_modules", "stripe"));

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const tripIdEnv = process.env.TRIP_ID;

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

function assertStripeConfigured(dotenv) {
  const sk = process.env.STRIPE_SECRET_KEY ?? dotenv.STRIPE_SECRET_KEY;
  const wh = process.env.STRIPE_WEBHOOK_SECRET ?? dotenv.STRIPE_WEBHOOK_SECRET;
  const invalid =
    !sk ||
    !wh ||
    sk === "sk_test_" ||
    wh === "whsec_" ||
    sk.length < 20 ||
    wh.length < 20 ||
    sk.startsWith("pk_");
  if (invalid) {
    console.error(`
❌ Clés Stripe invalides dans .env

STRIPE_SECRET_KEY doit etre la cle SECRETE (sk_test_...), PAS pk_test_...
  → Dashboard Stripe → Developers → API keys → Reveal secret key

STRIPE_WEBHOOK_SECRET = whsec_... affiche par:
  → .\\scripts\\stripe-listen.ps1   (terminal dedie, laisser ouvert)

Puis:
  docker compose -f docker-compose.dev.yml restart backend

Relancer ce script.
`);
    process.exit(1);
  }
  return { stripeSecretKey: sk, stripeWebhookSecret: wh };
}

function resolveStripeExe() {
  if (process.env.STRIPE_CLI_PATH) return process.env.STRIPE_CLI_PATH;
  if (process.platform === "win32") {
    const winGet = `${process.env.LOCALAPPDATA}\\Microsoft\\WinGet\\Packages\\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\\stripe.exe`;
    if (existsSync(winGet)) return winGet;
    const link = `${process.env.LOCALAPPDATA}\\Microsoft\\WinGet\\Links\\stripe.exe`;
    if (existsSync(link)) return link;
  }
  return "stripe";
}

function stripeCmd(args, stripeSecretKey) {
  const stripeExe = resolveStripeExe();
  const result = spawnSync(stripeExe, args, {
    encoding: "utf8",
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(
      `stripe ${args.join(" ")} failed: ${result.stderr || result.stdout || result.error?.message}`
    );
  }
  return (result.stdout ?? "").trim();
}

async function registerAndLogin() {
  const suffix = Date.now();
  const email = `e2e-stripe-${suffix}@example.com`;
  const password = "TestPass123!";

  const reg = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName: "E2E", lastName: "Stripe" }),
  });
  if (!reg.ok && reg.status !== 409) {
    throw new Error(`register failed: ${reg.status} ${await reg.text()}`);
  }

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error(`login failed: ${login.status}`);
  return { cookie, userId: (await login.json()).user?.id, email };
}

async function resolveTripId(cookie) {
  if (tripIdEnv) return tripIdEnv;
  const res = await fetch(`${baseUrl}/api/trips?limit=1`);
  const json = await res.json();
  const id = json.trips?.[0]?.id;
  if (!id) throw new Error("No trip found — create a trip via admin or set TRIP_ID");
  return id;
}

async function createPending(tripId, cookie) {
  const res = await fetch(`${baseUrl}/api/reservations/pending`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ tripId }),
  });
  const json = await res.json();
  if (res.status !== 201) {
    throw new Error(`pending failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function createCheckout(pendingReservationId, cookie) {
  const res = await fetch(`${baseUrl}/api/payments/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ pendingReservationId }),
  });
  const json = await res.json();
  if (res.status !== 200) {
    throw new Error(`checkout failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

function psqlQuery(sql) {
  return execFileSync(
    "docker",
    [
      "exec",
      "sharinggo-postgres-dev",
      "psql",
      "-U",
      "postgres",
      "-d",
      "sharinggo",
      "-t",
      "-A",
      "-c",
      sql,
    ],
    { encoding: "utf8" }
  ).trim();
}

/** Envoie un webhook signe (equivalent checkout.session.completed apres paiement). */
async function postCheckoutCompletedWebhook(
  sessionId,
  pendingReservationId,
  userId,
  tripId,
  eventId
) {
  const dotenv = loadDotEnv();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? dotenv.STRIPE_WEBHOOK_SECRET;

  const payload = {
    id: eventId,
    object: "event",
    type: "checkout.session.completed",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        metadata: {
          pendingReservationId,
          userId,
          tripId,
        },
        payment_intent: `pi_e2e_${eventId.replace(/[^a-zA-Z0-9]/g, "_")}`,
        payment_status: "paid",
        status: "complete",
      },
    },
  };

  const payloadString = JSON.stringify(payload);
  const stripe = new Stripe("sk_test_e2e_placeholder");
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: webhookSecret,
  });

  const res = await fetch(`${baseUrl}/api/webhooks/stripe`, {
    method: "POST",
    headers: {
      "stripe-signature": signature,
      "content-type": "application/json",
    },
    body: payloadString,
  });

  if (!res.ok) {
    throw new Error(`webhook POST failed: ${res.status} ${await res.text()}`);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForPaymentSucceeded(sessionId, maxMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const row = psqlQuery(
      `SELECT status, "reservationId" FROM "Payment" WHERE "stripeCheckoutSessionId" = '${sessionId}' LIMIT 1;`
    );
    if (row.includes("SUCCEEDED")) return row;
    await sleep(1500);
  }
  throw new Error(`Timeout waiting for Payment SUCCEEDED (session ${sessionId})`);
}

async function countReservationsForUser(userId) {
  return Number(
    psqlQuery(`SELECT COUNT(*) FROM "Reservation" WHERE "userId" = '${userId}' AND status = 'CONFIRMED';`)
  );
}

async function getTripAvailability(tripId) {
  const res = await fetch(`${baseUrl}/api/trips/${tripId}`);
  const json = await res.json();
  return {
    remainingSeats: json.remainingSeats,
    reservedSeats: json.reservedSeats,
  };
}

async function test1HappyPath(stripeSecretKey) {
  console.log("\n=== TEST 1 — Checkout réel + webhook ===");
  const { cookie, userId } = await registerAndLogin();
  const tripId = await resolveTripId(cookie);
  const before = await getTripAvailability(tripId);

  const pending = await createPending(tripId, cookie);
  const checkout = await createCheckout(pending.pendingReservationId, cookie);
  console.log("Checkout session:", checkout.stripeCheckoutSessionId);

  const eventId = `evt_e2e_${Date.now()}`;
  await postCheckoutCompletedWebhook(
    checkout.stripeCheckoutSessionId,
    pending.pendingReservationId,
    userId,
    tripId,
    eventId
  );

  const paymentRow = await waitForPaymentSucceeded(checkout.stripeCheckoutSessionId);
  const consumed = psqlQuery(
    `SELECT "consumedAt" IS NOT NULL FROM "PendingReservation" WHERE id = '${pending.pendingReservationId}';`
  );
  const reservations = await countReservationsForUser(userId);
  const after = await getTripAvailability(tripId);

  const ok =
    paymentRow.includes("SUCCEEDED") &&
    consumed === "t" &&
    reservations >= 1 &&
    after.remainingSeats < before.remainingSeats;

  console.log("Payment:", paymentRow);
  console.log("Pending consumed:", consumed);
  console.log("Reservations CONFIRMED:", reservations);
  console.log("Availability before/after:", before, "→", after);
  console.log(ok ? "✅ TEST 1 PASS" : "❌ TEST 1 FAIL");

  return { ok, checkout, pending, userId, tripId, cookie, eventId };
}

async function test2Duplicate(eventId, sessionId, pendingReservationId, userId, tripId) {
  console.log("\n=== TEST 2 — Webhook duplicate (meme event.id) ===");
  if (!eventId) {
    console.log("⚠️ TEST 2 SKIP — eventId manquant");
    return { ok: false, skipped: true };
  }

  const resBefore = psqlQuery(`SELECT COUNT(*) FROM "Reservation";`);
  const payBefore = psqlQuery(`SELECT COUNT(*) FROM "Payment" WHERE status = 'SUCCEEDED';`);

  await postCheckoutCompletedWebhook(
    sessionId,
    pendingReservationId,
    userId,
    tripId,
    eventId
  );
  await sleep(2000);

  const resAfter = psqlQuery(`SELECT COUNT(*) FROM "Reservation";`);
  const payAfter = psqlQuery(`SELECT COUNT(*) FROM "Payment" WHERE status = 'SUCCEEDED';`);
  const dupLog = psqlQuery(
    `SELECT COUNT(*) FROM "AuditLog" WHERE action = 'STRIPE_WEBHOOK_DUPLICATE';`
  );

  const noDuplicates = resBefore === resAfter && payBefore === payAfter;
  const ok = noDuplicates;

  console.log("Reservations:", resBefore, "→", resAfter);
  console.log("Payments SUCCEEDED:", payBefore, "→", payAfter);
  console.log("STRIPE_WEBHOOK_DUPLICATE audit count:", dupLog, Number(dupLog) >= 1 ? "(ok)" : "(warn)");
  console.log(ok ? "✅ TEST 2 PASS" : "❌ TEST 2 FAIL");
  return { ok, eventId };
}

async function test3ExpiredPending(stripeSecretKey) {
  console.log("\n=== TEST 3 — Pending expirée + paiement ===");
  const { cookie, userId } = await registerAndLogin();
  const tripId = await resolveTripId(cookie);
  const pending = await createPending(tripId, cookie);
  const checkout = await createCheckout(pending.pendingReservationId, cookie);

  psqlQuery(
    `UPDATE "PendingReservation" SET "expiresAt" = NOW() - INTERVAL '1 minute' WHERE id = '${pending.pendingReservationId}';`
  );

  await postCheckoutCompletedWebhook(
    checkout.stripeCheckoutSessionId,
    pending.pendingReservationId,
    userId,
    tripId,
    `evt_e2e_expired_${Date.now()}`
  );
  await sleep(2000);

  const paymentStatus = psqlQuery(
    `SELECT status FROM "Payment" WHERE "stripeCheckoutSessionId" = '${checkout.stripeCheckoutSessionId}';`
  );
  const resCount = psqlQuery(
    `SELECT COUNT(*) FROM "Reservation" r JOIN "Payment" p ON p."reservationId" = r.id WHERE p."stripeCheckoutSessionId" = '${checkout.stripeCheckoutSessionId}';`
  );

  const ok = paymentStatus === "FAILED" && resCount === "0";
  console.log("Payment status:", paymentStatus);
  console.log("Reservations linked:", resCount);
  console.log(ok ? "✅ TEST 3 PASS" : "❌ TEST 3 FAIL");
  return { ok };
}

async function main() {
  console.log("S1-T4 Stripe E2E — CTO checklist");
  console.log("Base URL:", baseUrl);

  const dotenv = loadDotEnv();
  const { stripeSecretKey } = assertStripeConfigured(dotenv);

  try {
    const health = await fetch(`${baseUrl}/health`);
    if (!health.ok) throw new Error("Backend /health not OK");
  } catch (e) {
    console.error("Backend inaccessible:", e.message);
    process.exit(1);
  }

  const t1 = await test1HappyPath(stripeSecretKey);
  const t2 = await test2Duplicate(
    t1.eventId,
    t1.checkout?.stripeCheckoutSessionId,
    t1.pending?.pendingReservationId,
    t1.userId,
    t1.tripId
  );
  const t3 = await test3ExpiredPending(stripeSecretKey);

  const allPass = t1.ok && (t2.ok || t2.skipped) && t3.ok;
  console.log("\n========================================");
  if (allPass && !t2.skipped) {
    console.log("✅ TOUS LES TESTS E2E PASS — GO COMMIT (validation CTO)");
    process.exit(0);
  }
  if (t1.ok && t3.ok && t2.skipped) {
    console.log("⚠️ TEST 1 & 3 OK — compléter TEST 2 manuellement (stripe events resend)");
    process.exit(0);
  }
  console.log("❌ ÉCHEC — corriger avant commit");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
