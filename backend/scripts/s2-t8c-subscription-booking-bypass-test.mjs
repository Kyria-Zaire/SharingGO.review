/**
 * S2-T8C — Subscription booking bypass tests.
 *
 * Usage (repo root):
 *   node backend/scripts/s2-t8c-subscription-booking-bypass-test.mjs
 *
 * Requires: backend on :3000, demo seed.
 * Recommandé : `RATE_LIMIT_RESERVATION_MAX=40` (ce script fait >10 POST réservation/min).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const password = "DemoPassword123!";

const FORBIDDEN = [
  "stripePaymentIntentId",
  "stripeCheckoutSessionId",
  "pi_",
  "cs_",
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

async function login(email, attempt = 0) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (res.status === 429 && attempt < 4) {
    await new Promise((r) => setTimeout(r, 5_000));
    return login(email, attempt + 1);
  }
  if (!res.ok) throw new Error(`login ${email}: ${res.status}`);
  return res.headers.get("set-cookie").split(";")[0];
}

async function listTrips() {
  const res = await fetch(`${baseUrl}/api/trips?limit=50`);
  if (!res.ok) throw new Error(`trips list: ${res.status}`);
  const body = await res.json();
  return body.trips ?? body;
}

async function bookWithSubscription(cookie, tripId) {
  const res = await fetch(`${baseUrl}/api/reservations/book-with-subscription`, {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ tripId }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, code: body.error?.code };
}

async function createPending(cookie, tripId) {
  const res = await fetch(`${baseUrl}/api/reservations/pending`, {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ tripId }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, code: body.error?.code };
}

async function createCheckout(cookie, pendingReservationId) {
  const res = await fetch(`${baseUrl}/api/payments/checkout`, {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ pendingReservationId }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function pickTrip(trips, predicate) {
  const t = trips.find(predicate);
  if (!t) throw new Error(`no trip matching predicate among ${trips.length} trips`);
  return t;
}

async function adminDisableTrip(adminCookie, tripId) {
  const res = await fetch(`${baseUrl}/api/admin/trips/${tripId}/disable`, {
    method: "POST",
    headers: { cookie: adminCookie },
  });
  if (!res.ok) throw new Error(`admin disable trip: ${res.status}`);
}

async function adminEnableTrip(adminCookie, tripId) {
  const res = await fetch(`${baseUrl}/api/admin/trips/${tripId}/enable`, {
    method: "POST",
    headers: { cookie: adminCookie },
  });
  if (!res.ok) throw new Error(`admin enable trip: ${res.status}`);
}

async function adminPatchTrip(adminCookie, tripId, body) {
  const res = await fetch(`${baseUrl}/api/admin/trips/${tripId}`, {
    method: "PATCH",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`admin patch trip: ${res.status}`);
  return res.json();
}

async function adminCreateRaceTrip(adminCookie, lineId) {
  const departureTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
  const arrivalTime = new Date(Date.now() + 72 * 60 * 60 * 1000 + 40 * 60 * 1000).toISOString();
  const res = await fetch(`${baseUrl}/api/admin/trips`, {
    method: "POST",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ lineId, departureTime, arrivalTime, totalSeats: 1 }),
  });
  const body = await res.json();
  if (res.status !== 201) throw new Error(`admin create race trip: ${res.status}`);
  const id = body.trip?.id ?? body.id;
  if (!id) throw new Error("admin create race trip: missing id");
  return id;
}

async function main() {
  for (const [k, v] of Object.entries(loadDotEnv())) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  const trips = await listTrips();
  const tripWithSpace = pickTrip(trips, (t) => t.remainingSeats >= 2);
  const tripFull = pickTrip(trips, (t) => t.remainingSeats === 0);
  const lineId = trips[0]?.line?.id ?? trips[0]?.lineId;
  if (!lineId) throw new Error("no lineId on public trips");

  const passengerCookie = await login("passenger01@sharinggo.demo");
  const expiredCookie = await login("mosolf-expired@sharinggo.demo");
  const mosolfCookie = await login("mosolf-active@sharinggo.demo");
  const convoyeurMonthlyCookie = await login("convoyeur-monthly@sharinggo.demo");

  let r = await bookWithSubscription(passengerCookie, tripWithSpace.id);
  if (r.status !== 403 || r.code !== "SUBSCRIPTION_REQUIRED") {
    throw new Error(`passenger no sub: ${r.status} ${r.code}`);
  }
  console.log("✓ passager sans abonnement → SUBSCRIPTION_REQUIRED");

  r = await bookWithSubscription(expiredCookie, tripWithSpace.id);
  if (r.status !== 403 || r.code !== "SUBSCRIPTION_REQUIRED") {
    throw new Error(`expired sub: ${r.status} ${r.code}`);
  }
  console.log("✓ abonnement expiré → SUBSCRIPTION_REQUIRED");

  const adminCookie = await login("admin@sharinggo.demo");
  const raceTripId = await adminCreateRaceTrip(adminCookie, lineId);
  const [raceA, raceB] = await Promise.all([
    bookWithSubscription(mosolfCookie, raceTripId),
    bookWithSubscription(convoyeurMonthlyCookie, raceTripId),
  ]);
  const oneWin =
    (raceA.status === 201 && raceB.status === 409 && raceB.code === "TRIP_FULL") ||
    (raceB.status === 201 && raceA.status === 409 && raceA.code === "TRIP_FULL");
  if (!oneWin) {
    throw new Error(`concurrency fail: A=${raceA.status}/${raceA.code} B=${raceB.status}/${raceB.code}`);
  }
  console.log("✓ concurrence dernier siège → 1 succès, 1 TRIP_FULL");

  const bookTripId = pickTrip(trips, (t) => t.id !== tripFull.id && t.remainingSeats >= 3).id;
  const activeBook = await bookWithSubscription(mosolfCookie, bookTripId);
  if (activeBook.status !== 201) {
    throw new Error(`active book: ${activeBook.status} ${JSON.stringify(activeBook.body)}`);
  }
  if (activeBook.body.reservation?.status !== "CONFIRMED") throw new Error("expected CONFIRMED");
  if (activeBook.body.payment?.type !== "SUBSCRIPTION_ACCESS") {
    throw new Error("expected SUBSCRIPTION_ACCESS");
  }
  if (activeBook.body.payment?.status !== "SUCCEEDED") throw new Error("expected SUCCEEDED payment");
  if (activeBook.body.payment?.amount !== "0.00") {
    throw new Error(`expected 0.00 got ${activeBook.body.payment?.amount}`);
  }
  assertSafe("book active", activeBook.body);
  const confirmedReservationId = activeBook.body.reservation.id;
  console.log("✓ abonné actif → CONFIRMED + SUBSCRIPTION_ACCESS 0€");

  r = await bookWithSubscription(mosolfCookie, bookTripId);
  if (r.status !== 409 || r.code !== "RESERVATION_ALREADY_EXISTS") {
    throw new Error(`duplicate: ${r.status} ${r.code}`);
  }
  console.log("✓ double booking → RESERVATION_ALREADY_EXISTS");

  const pendingTrip = pickTrip(
    trips,
    (t) => t.remainingSeats >= 2 && t.id !== bookTripId
  ).id;
  const pending = await createPending(convoyeurMonthlyCookie, pendingTrip);
  if (pending.status !== 201) throw new Error(`pending create: ${pending.status}`);
  r = await bookWithSubscription(convoyeurMonthlyCookie, pendingTrip);
  if (r.status !== 409 || r.code !== "PENDING_ALREADY_EXISTS") {
    throw new Error(`pending conflict: ${r.status} ${r.code}`);
  }
  console.log("✓ pending active → PENDING_ALREADY_EXISTS");

  r = await bookWithSubscription(mosolfCookie, tripFull.id);
  if (r.status !== 409 || r.code !== "TRIP_FULL") {
    throw new Error(`trip full: ${r.status} ${r.code}`);
  }
  console.log("✓ trip full → TRIP_FULL");

  const disabledTrip = pickTrip(
    trips,
    (t) => t.remainingSeats >= 1 && t.id !== bookTripId && t.id !== pendingTrip
  ).id;
  await adminDisableTrip(adminCookie, disabledTrip);
  r = await bookWithSubscription(mosolfCookie, disabledTrip);
  await adminEnableTrip(adminCookie, disabledTrip);
  if (r.status !== 400 || r.code !== "TRIP_DISABLED") {
    throw new Error(`trip disabled: ${r.status} ${r.code}`);
  }
  console.log("✓ trip disabled → TRIP_DISABLED");

  const pastTrip = pickTrip(
    trips,
    (t) => t.remainingSeats >= 1 && t.id !== bookTripId && t.id !== pendingTrip && t.id !== disabledTrip
  ).id;
  const pastDetail = await fetch(`${baseUrl}/api/admin/trips/${pastTrip}`, {
    headers: { cookie: adminCookie },
  });
  const pastBody = await pastDetail.json();
  const oldDepartureTime = pastBody.departureTime;
  const pastIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  await adminPatchTrip(adminCookie, pastTrip, { departureTime: pastIso });
  r = await bookWithSubscription(convoyeurMonthlyCookie, pastTrip);
  await adminPatchTrip(adminCookie, pastTrip, { departureTime: oldDepartureTime });
  if (r.status !== 400 || r.code !== "TRIP_PAST") {
    throw new Error(`trip past: ${r.status} ${r.code}`);
  }
  console.log("✓ trip passé → TRIP_PAST");

  const listRes = await fetch(`${baseUrl}/api/reservations?limit=5`, {
    headers: { cookie: mosolfCookie },
  });
  const listBody = await listRes.json();
  if (!listBody.reservations?.some((x) => x.id === confirmedReservationId)) {
    throw new Error("reservation not in GET /api/reservations");
  }
  console.log("✓ GET /api/reservations voit la réservation");

  const payRes = await fetch(`${baseUrl}/api/payments?limit=20`, {
    headers: { cookie: mosolfCookie },
  });
  const payBody = await payRes.json();
  const subPay = payBody.payments?.find((p) => p.type === "SUBSCRIPTION_ACCESS");
  if (!subPay || subPay.amount !== "0.00") throw new Error("SUBSCRIPTION_ACCESS payment missing in history");
  assertSafe("payments list", payBody);
  console.log("✓ GET /api/payments → SUBSCRIPTION_ACCESS 0€");

  const adminRes = await fetch(`${baseUrl}/api/admin/reservations?limit=5`, {
    headers: { cookie: adminCookie },
  });
  if (!adminRes.ok) throw new Error(`admin reservations: ${adminRes.status}`);
  const adminPay = await fetch(`${baseUrl}/api/admin/payments?type=SUBSCRIPTION_ACCESS&limit=5`, {
    headers: { cookie: adminCookie },
  });
  if (!adminPay.ok) throw new Error(`admin payments: ${adminPay.status}`);
  console.log("✓ admin reservations/payments OK");

  const tripAfter = await fetch(`${baseUrl}/api/trips/${bookTripId}`);
  const tripBody = await tripAfter.json();
  if (typeof tripBody.remainingSeats !== "number") throw new Error("missing remainingSeats on public trip");
  console.log("✓ public trip remainingSeats exposé");

  const pendingSmoke = await createPending(passengerCookie, tripWithSpace.id);
  if (pendingSmoke.status !== 201) throw new Error(`ticket pending smoke: ${pendingSmoke.status}`);
  const checkoutSmoke = await createCheckout(passengerCookie, pendingSmoke.body.pendingReservationId);
  if (checkoutSmoke.status !== 200) {
    throw new Error(`ticket checkout smoke: ${checkoutSmoke.status}`);
  }
  if (!checkoutSmoke.body.stripeCheckoutSessionId?.startsWith("cs_")) {
    throw new Error("checkout smoke: missing stripeCheckoutSessionId");
  }
  console.log("✓ non-régression pending + checkout ticket");

  const openapi = readFileSync(join(repoRoot, "backend", "src", "docs", "openapi.json"), "utf8");
  if (!openapi.includes("/api/reservations/book-with-subscription")) {
    throw new Error("OpenAPI missing book-with-subscription");
  }
  if (!openapi.includes("SUBSCRIPTION_ACCESS")) {
    throw new Error("OpenAPI missing SUBSCRIPTION_ACCESS");
  }
  console.log("✓ OpenAPI à jour");

  console.log("\nS2-T8C subscription booking bypass tests OK");
}

main().catch((e) => {
  console.error("S2-T8C FAILED:", e.message);
  process.exit(1);
});
