/**
 * S1.5-T1 — Test owner CONFIRMED + GET list/detail + JSON safe.
 */
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const Stripe = require(join(dirname(fileURLToPath(import.meta.url)), "..", "node_modules", "stripe"));
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

const FORBIDDEN = [
  "stripePaymentIntentId",
  "stripeCheckoutSessionId",
  "stripeInvoiceId",
  "stripeSubscriptionId",
  "boardingToken",
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

function assertJsonSafe(label, obj) {
  const json = JSON.stringify(obj);
  const leaks = FORBIDDEN.filter((k) => json.includes(k));
  if (leaks.length > 0) {
    throw new Error(`${label}: forbidden fields leaked: ${leaks.join(", ")}`);
  }
}

async function postWebhook(sessionId, pendingId, userId, tripId) {
  const wh = loadDotEnv().STRIPE_WEBHOOK_SECRET;
  const eventId = `evt_s15t1_${Date.now()}`;
  const payload = {
    id: eventId,
    object: "event",
    type: "checkout.session.completed",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        metadata: { pendingReservationId: pendingId, userId, tripId },
        payment_intent: `pi_s15t1_${Date.now()}`,
        payment_status: "paid",
        status: "complete",
      },
    },
  };
  const payloadString = JSON.stringify(payload);
  const stripe = new Stripe("sk_test_placeholder");
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: wh,
  });
  const res = await fetch(`${baseUrl}/api/webhooks/stripe`, {
    method: "POST",
    headers: { "stripe-signature": signature, "content-type": "application/json" },
    body: payloadString,
  });
  if (!res.ok) throw new Error(`webhook failed: ${res.status} ${await res.text()}`);
}

async function main() {
  const suffix = Date.now();
  const email = `owner-hist-${suffix}@example.com`;
  const password = "TestPass123!";

  const reg = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName: "Owner", lastName: "Hist" }),
  });
  if (!reg.ok) throw new Error(`register ${reg.status}`);

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  const loginJson = await login.json();
  const userId = loginJson.user?.id;
  if (!cookie || !userId) throw new Error("login failed");

  const tripsRes = await fetch(`${baseUrl}/api/trips?limit=1`);
  const tripId = (await tripsRes.json()).trips?.[0]?.id;
  if (!tripId) throw new Error("no trip");

  const pendingRes = await fetch(`${baseUrl}/api/reservations/pending`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ tripId }),
  });
  const pending = await pendingRes.json();
  if (pendingRes.status !== 201) throw new Error(`pending ${pendingRes.status}`);

  const checkoutRes = await fetch(`${baseUrl}/api/payments/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ pendingReservationId: pending.pendingReservationId }),
  });
  const checkout = await checkoutRes.json();
  if (checkoutRes.status !== 200) throw new Error(`checkout ${checkoutRes.status}`);

  await postWebhook(
    checkout.stripeCheckoutSessionId,
    pending.pendingReservationId,
    userId,
    tripId
  );

  await new Promise((r) => setTimeout(r, 2000));

  const listRes = await fetch(`${baseUrl}/api/reservations`, { headers: { Cookie: cookie } });
  const list = await listRes.json();
  if (listRes.status !== 200) throw new Error(`list ${listRes.status}`);
  if (!list.reservations?.length) throw new Error("list empty after CONFIRMED");
  const item = list.reservations[0];
  if (item.status !== "CONFIRMED") throw new Error(`expected CONFIRMED got ${item.status}`);
  if (!item.payment) throw new Error("payment missing in list");
  if (!item.trip?.line?.name) throw new Error("trip.line missing in list");
  assertJsonSafe("list", list);

  const detailRes = await fetch(`${baseUrl}/api/reservations/${item.id}`, {
    headers: { Cookie: cookie },
  });
  const detail = await detailRes.json();
  if (detailRes.status !== 200) throw new Error(`detail ${detailRes.status}`);
  if (!detail.payment || detail.payment.status !== "SUCCEEDED") {
    throw new Error("detail payment not SUCCEEDED");
  }
  assertJsonSafe("detail", detail);

  console.log("PASS owner history E2E");
  console.log("email:", email);
  console.log("reservationId:", item.id);
  console.log("Cookie:", cookie);
  console.log("list.payment:", JSON.stringify(item.payment));
  console.log("detail.payment:", JSON.stringify(detail.payment));
  console.log(`curl.exe -b "${cookie}" ${baseUrl}/api/reservations`);
  console.log(`curl.exe -b "${cookie}" ${baseUrl}/api/reservations/${item.id}`);
}

main().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
