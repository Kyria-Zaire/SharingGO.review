/**
 * S1.5-T2 — Tests owner payments list/detail + JSON safe.
 * Prerequisite: creates a SUCCEEDED payment via pending+checkout+webhook when needed.
 */
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const Stripe = require(join(dirname(fileURLToPath(import.meta.url)), "..", "node_modules", "stripe"));
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

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

async function ensureSucceededPayment(cookie, userId) {
  const list = await fetch(`${baseUrl}/api/payments?status=SUCCEEDED`, { headers: { Cookie: cookie } });
  const json = await list.json();
  if (json.payments?.length > 0) return json.payments[0].id;

  const trips = await (await fetch(`${baseUrl}/api/trips?limit=1`)).json();
  const tripId = trips.trips?.[0]?.id;
  const pendingRes = await fetch(`${baseUrl}/api/reservations/pending`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ tripId }),
  });
  const pending = await pendingRes.json();
  const checkoutRes = await fetch(`${baseUrl}/api/payments/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ pendingReservationId: pending.pendingReservationId }),
  });
  const checkout = await checkoutRes.json();
  const wh = loadDotEnv().STRIPE_WEBHOOK_SECRET;
  const eventId = `evt_s152t2_${Date.now()}`;
  const payload = {
    id: eventId,
    object: "event",
    type: "checkout.session.completed",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: checkout.stripeCheckoutSessionId,
        object: "checkout.session",
        metadata: {
          pendingReservationId: pending.pendingReservationId,
          userId,
          tripId,
        },
        payment_intent: `pi_s152t2_${Date.now()}`,
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
  await fetch(`${baseUrl}/api/webhooks/stripe`, {
    method: "POST",
    headers: { "stripe-signature": signature, "content-type": "application/json" },
    body: payloadString,
  });
  await new Promise((r) => setTimeout(r, 2000));
  const list2 = await fetch(`${baseUrl}/api/payments`, { headers: { Cookie: cookie } });
  const json2 = await list2.json();
  if (!json2.payments?.length) throw new Error("payment not created");
  return json2.payments[0].id;
}
const FORBIDDEN = [
  "stripePaymentIntentId",
  "stripeCheckoutSessionId",
  "stripeInvoiceId",
  "stripeSubscriptionId",
  "boardingToken",
];

function assertSafe(label, obj) {
  const json = JSON.stringify(obj);
  const leaks = FORBIDDEN.filter((k) => json.includes(k));
  if (leaks.length) throw new Error(`${label}: leaked ${leaks.join(", ")}`);
}

async function login(email, password) {
  await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName: "Pay", lastName: "Read" }),
  });
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  const json = await res.json();
  if (!cookie || !json.user?.id) throw new Error("login failed");
  return { cookie, userId: json.user.id };
}

async function main() {
  const noAuth = await fetch(`${baseUrl}/api/payments`);
  if (noAuth.status !== 401) throw new Error(`expected 401 got ${noAuth.status}`);

  const badLimit = await fetch(`${baseUrl}/api/payments?limit=101`);
  if (badLimit.status !== 401 && badLimit.status !== 400) {
    /* without auth may be 401 first */
  }

  const suffix = Date.now();
  const userA = await login(`payA-${suffix}@example.com`, "TestPass123!");
  const userB = await login(`payB-${suffix}@example.com`, "TestPass123!");
  const cookieA = userA.cookie;
  const cookieB = userB.cookie;

  await ensureSucceededPayment(cookieA, userA.userId);

  const limitRes = await fetch(`${baseUrl}/api/payments?limit=101`, {
    headers: { Cookie: cookieA },
  });
  if (limitRes.status !== 400) throw new Error(`limit 101 expected 400 got ${limitRes.status}`);

  const listRes = await fetch(`${baseUrl}/api/payments?status=SUCCEEDED&type=TICKET`, {
    headers: { Cookie: cookieA },
  });
  const list = await listRes.json();
  if (listRes.status !== 200) throw new Error(`list ${listRes.status}`);
  assertSafe("list", list);

  if (!list.payments?.length) throw new Error("list empty after ensure payment");
  const p = list.payments[0];
  if (p.status !== "SUCCEEDED") throw new Error("expected SUCCEEDED");
  if (!p.reservation?.trip?.line) throw new Error("missing reservation.trip.line");

  const detailRes = await fetch(`${baseUrl}/api/payments/${p.id}`, {
    headers: { Cookie: cookieA },
  });
  const detail = await detailRes.json();
  if (detailRes.status !== 200) throw new Error(`detail ${detailRes.status}`);
  assertSafe("detail", detail);

  const otherRes = await fetch(`${baseUrl}/api/payments/${p.id}`, {
    headers: { Cookie: cookieB },
  });
  if (otherRes.status !== 404) throw new Error(`other user expected 404 got ${otherRes.status}`);
  const err = await otherRes.json();
  if (err.error?.code !== "PAYMENT_NOT_FOUND") throw new Error("wrong error code");

  console.log("PASS S1.5-T2 payment status API");
}

main().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
