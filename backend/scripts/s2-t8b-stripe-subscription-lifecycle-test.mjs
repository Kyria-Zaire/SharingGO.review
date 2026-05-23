/**
 * S2-T8B — Stripe subscription checkout + webhook lifecycle tests.
 *
 * Usage (repo root):
 *   node backend/scripts/s2-t8b-stripe-subscription-lifecycle-test.mjs
 *
 * Requires: backend on :3000, demo seed, STRIPE_WEBHOOK_SECRET, valid price_ env vars for checkout tests.
 */
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const Stripe = require(join(dirname(fileURLToPath(import.meta.url)), "..", "node_modules", "stripe"));
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const password = "DemoPassword123!";

const FORBIDDEN = ["stripeCustomerId", "cus_", "sub_"];

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

async function subscriptionMe(cookie) {
  const res = await fetch(`${baseUrl}/api/subscriptions/me`, { headers: { cookie } });
  return { status: res.status, body: await res.json() };
}

async function subscriptionCheckout(cookie, type) {
  const res = await fetch(`${baseUrl}/api/subscriptions/checkout`, {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ type }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function postWebhook(eventPayload, secret) {
  const payloadString = JSON.stringify(eventPayload);
  const stripe = new Stripe("sk_test_placeholder");
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret,
  });
  const res = await fetch(`${baseUrl}/api/webhooks/stripe`, {
    method: "POST",
    headers: { "stripe-signature": signature, "content-type": "application/json" },
    body: payloadString,
  });
  return res.status;
}

async function getUserIdByEmail(email) {
  const cookie = await login(email);
  const me = await fetch(`${baseUrl}/api/auth/me`, { headers: { cookie } });
  const body = await me.json();
  if (!body.id) throw new Error(`no user id for ${email}`);
  return body.id;
}

async function main() {
  const dotenv = loadDotEnv();
  for (const [k, v] of Object.entries(dotenv)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret?.startsWith("whsec_")) {
    throw new Error("STRIPE_WEBHOOK_SECRET required for webhook tests");
  }

  const cookies = {
    passenger02: await login("passenger02@sharinggo.demo"),
    mosolfActive: await login("mosolf-active@sharinggo.demo"),
    mosolfExpired: await login("mosolf-expired@sharinggo.demo"),
    admin: await login("admin@sharinggo.demo"),
  };

  if ((await subscriptionMe("")).status !== 401) throw new Error("expected 401");
  console.log("✓ sans auth → 401");

  const passengerCookie = cookies.passenger02;
  const meNoSub = await subscriptionMe(passengerCookie);
  if (meNoSub.body.subscription !== null || meNoSub.body.isActive !== false) {
    throw new Error("passenger02 expected no subscription");
  }
  console.log("✓ passager sans abonnement → null");

  const activeBlocked = await subscriptionCheckout(cookies.mosolfActive, "CONVOYEUR_MONTHLY");
  if (activeBlocked.status !== 409) {
    throw new Error(`active user checkout expected 409 got ${activeBlocked.status}`);
  }
  console.log("✓ mosolf-active → 409 SUBSCRIPTION_ALREADY_ACTIVE");

  const ineligibleEmail = `ineligible-s28b-${Date.now()}@example.com`;
  const reg = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ineligibleEmail, password, firstName: "Test", lastName: "Ineligible" }),
  });
  if (!reg.ok) throw new Error(`register ineligible user: ${reg.status}`);
  const ineligibleCookie = await login(ineligibleEmail);
  const mosolfForbidden = await subscriptionCheckout(ineligibleCookie, "MOSOLF_MONTHLY");
  if (mosolfForbidden.status !== 403) {
    throw new Error(`MOSOLF ineligible expected 403 got ${mosolfForbidden.status}`);
  }
  console.log("✓ email hors Mosolf → 403 SUBSCRIPTION_NOT_ELIGIBLE");

  const priceId = process.env.STRIPE_PRICE_CONVOYEUR_MONTHLY ?? "";
  const priceOk =
    priceId.startsWith("price_") &&
    !priceId.includes("your_") &&
    !priceId.includes("placeholder");
  if (priceOk) {
    const checkout = await subscriptionCheckout(passengerCookie, "CONVOYEUR_MONTHLY");
    if (checkout.status !== 200 || !checkout.body.checkoutUrl) {
      throw new Error(`checkout failed: ${checkout.status} ${JSON.stringify(checkout.body)}`);
    }
    console.log("✓ CONVOYEUR_MONTHLY checkout → session URL");
  } else {
    console.log("⊘ checkout Stripe skipped (set real STRIPE_PRICE_CONVOYEUR_MONTHLY in .env)");
  }

  const targetEmail = "passenger02@sharinggo.demo";
  const userId = await getUserIdByEmail(targetEmail);
  const now = Math.floor(Date.now() / 1000);
  const periodEnd = now + 30 * 24 * 3600;
  const subId = `sub_s28b_${Date.now()}`;
  const eventId = `evt_s28b_created_${Date.now()}`;

  const createdPayload = {
    id: eventId,
    object: "event",
    type: "customer.subscription.created",
    created: now,
    data: {
      object: {
        id: subId,
        object: "subscription",
        customer: "cus_s28b_test",
        status: "active",
        current_period_start: now,
        current_period_end: periodEnd,
        metadata: {
          userId,
          subscriptionType: "CONVOYEUR_MONTHLY",
        },
      },
    },
  };

  if ((await postWebhook(createdPayload, whSecret)) !== 200) {
    throw new Error("subscription.created webhook failed");
  }

  const afterCreate = await subscriptionMe(passengerCookie);
  if (!afterCreate.body.isActive || afterCreate.body.subscription?.status !== "ACTIVE") {
    throw new Error(`expected ACTIVE after webhook: ${JSON.stringify(afterCreate.body)}`);
  }
  assertSafe("after create", afterCreate.body);
  console.log("✓ webhook created → ACTIVE, GET /me isActive=true");

  const dupStatus = await postWebhook(createdPayload, whSecret);
  if (dupStatus !== 200) throw new Error("duplicate webhook should return 200");
  console.log("✓ duplicate event.id → 200 idempotent");

  const updatedPayload = {
    id: `evt_s28b_updated_${Date.now()}`,
    object: "event",
    type: "customer.subscription.updated",
    created: now,
    data: {
      object: {
        ...createdPayload.data.object,
        status: "past_due",
      },
    },
  };
  await postWebhook(updatedPayload, whSecret);
  const afterPastDue = await subscriptionMe(passengerCookie);
  if (afterPastDue.body.isActive !== false || afterPastDue.body.subscription?.status !== "PAST_DUE") {
    throw new Error(`expected PAST_DUE inactive: ${JSON.stringify(afterPastDue.body)}`);
  }
  console.log("✓ webhook updated past_due → isActive=false");

  const deletedPayload = {
    id: `evt_s28b_deleted_${Date.now()}`,
    object: "event",
    type: "customer.subscription.deleted",
    created: now,
    data: {
      object: {
        ...createdPayload.data.object,
        status: "canceled",
      },
    },
  };
  await postWebhook(deletedPayload, whSecret);
  const afterDelete = await subscriptionMe(passengerCookie);
  if (afterDelete.body.subscription?.status !== "CANCELED") {
    throw new Error(`expected CANCELED: ${JSON.stringify(afterDelete.body)}`);
  }
  console.log("✓ webhook deleted → CANCELED");

  const expiredMe = await subscriptionMe(cookies.mosolfExpired);
  if (expiredMe.body.isActive !== false) throw new Error("mosolf-expired should be inactive");
  console.log("✓ mosolf-expired seed → isActive=false");

  const ticketSmoke = await fetch(`${baseUrl}/api/boarding/validate`, {
    method: "POST",
    headers: {
      cookie: cookies.admin,
      "content-type": "application/json",
    },
    body: JSON.stringify({ boardingToken: "not.a.jwt" }),
  });
  if (ticketSmoke.status !== 200) throw new Error("ticket validate flow regression");
  console.log("✓ boarding validate (ticket path) non régressé");

  console.log("\nS2-T8B subscription lifecycle tests OK");
}

main().catch((e) => {
  console.error("S2-T8B FAILED:", e.message);
  process.exit(1);
});
