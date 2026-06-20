/**
 * OPS-03B VERIFY — Boarding lifecycle guard (validate + consume).
 *
 * Fixture 100 % API : trip admin + 2 réservations CONFIRMED via abonnement
 * (même DB que le backend — pas d'INSERT SQL cross-DB).
 *
 * Usage:
 *   node backend/scripts/ops03b-boarding-lifecycle-verify.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const password = "DemoPassword123!";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function login(email, attempt = 0) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (res.status === 429 && attempt < 5) {
    await sleep(5000);
    return login(email, attempt + 1);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`login ${email}: ${res.status} ${JSON.stringify(body)}`);
  return res.headers.get("set-cookie").split(";")[0];
}

async function jsonFetch(path, { method = "GET", cookie, body } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function lifecyclePost(path, cookie, body) {
  const res = await jsonFetch(path, { method: "POST", cookie, body });
  await sleep(250);
  return res;
}

async function createTrip(adminCookie) {
  const lines = await jsonFetch("/api/admin/lines?limit=1", { cookie: adminCookie });
  const lineId = lines.data.lines?.[0]?.id;
  if (!lineId) throw new Error("no line for fixture");

  const departure = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const arrival = new Date(departure.getTime() + 2 * 60 * 60 * 1000);
  const created = await jsonFetch("/api/admin/trips", {
    method: "POST",
    cookie: adminCookie,
    body: {
      lineId,
      departureTime: departure.toISOString(),
      arrivalTime: arrival.toISOString(),
      totalSeats: 8,
    },
  });
  if (created.status !== 201 || !created.data.trip?.id) {
    throw new Error(`fixture trip create failed: ${created.status} ${JSON.stringify(created.data)}`);
  }
  return created.data.trip.id;
}

async function bookWithSubscription(passengerCookie, tripId) {
  const res = await jsonFetch("/api/reservations/book-with-subscription", {
    method: "POST",
    cookie: passengerCookie,
    body: { tripId },
  });
  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`book-with-subscription failed: ${res.status} ${JSON.stringify(res.data)}`);
  }
  const reservationId = res.data.reservation?.id;
  if (!reservationId) throw new Error("missing reservation id after book");
  if (res.data.reservation?.status !== "CONFIRMED") {
    throw new Error(`expected CONFIRMED got ${res.data.reservation?.status}`);
  }
  return reservationId;
}

async function getBoardingJwt(passengerCookie, reservationId) {
  const tok = await jsonFetch(`/api/boarding/${reservationId}/token`, { cookie: passengerCookie });
  if (tok.status !== 200 || !tok.data.boardingToken) {
    throw new Error(`boarding token failed: ${tok.status} ${JSON.stringify(tok.data)}`);
  }
  return tok.data.boardingToken;
}

async function createBoardingFixture(adminCookie) {
  const tripId = await createTrip(adminCookie);
  const mosolfCookie = await login("mosolf-active@sharinggo.demo");
  const convoyeurCookie = await login("convoyeur-monthly@sharinggo.demo");

  const resAId = await bookWithSubscription(mosolfCookie, tripId);
  const resBId = await bookWithSubscription(convoyeurCookie, tripId);

  const jwtA = await getBoardingJwt(mosolfCookie, resAId);
  const jwtB = await getBoardingJwt(convoyeurCookie, resBId);

  return { tripId, resAId, resBId, jwtA, jwtB, mosolfCookie, convoyeurCookie };
}

async function cleanupFixture(adminCookie, fixture) {
  await jsonFetch(`/api/admin/trips/${fixture.tripId}/disable`, {
    method: "POST",
    cookie: adminCookie,
  });
}

async function boardingPost(path, cookie, jwt) {
  return jsonFetch(path, {
    method: "POST",
    cookie,
    body: { boardingToken: jwt },
  });
}

async function setLifecycleWaiting(adminCookie, tripId) {
  // Pas d'endpoint reset — on s'appuie sur trip fraîchement créé (WAITING par défaut).
  const trip = await jsonFetch(`/api/admin/trips/${tripId}`, { cookie: adminCookie });
  if (trip.data.trip?.lifecycleStatus !== "WAITING") {
    throw new Error(`expected fresh trip WAITING got ${trip.data.trip?.lifecycleStatus}`);
  }
}

async function main() {
  loadDotEnv();

  const adminCookie = await login("admin@sharinggo.demo");
  const fixture = await createBoardingFixture(adminCookie);

  try {
    console.log(
      "Fixture API: trip=%s resA=%s resB=%s",
      fixture.tripId,
      fixture.resAId,
      fixture.resBId
    );

    await setLifecycleWaiting(adminCookie, fixture.tripId);

    // 1. WAITING → validate → BOARDING_NOT_STARTED
    let res = await boardingPost("/api/boarding/validate", adminCookie, fixture.jwtA);
    if (res.status !== 200 || res.data.reason !== "BOARDING_NOT_STARTED") {
      throw new Error(`[1] WAITING validate: ${JSON.stringify(res.data)}`);
    }
    console.log("✓ [1] WAITING → validate → BOARDING_NOT_STARTED");

    // 2. BOARDING → validate → valid true
    await lifecyclePost(`/api/admin/trips/${fixture.tripId}/start-boarding`, adminCookie);
    res = await boardingPost("/api/boarding/validate", adminCookie, fixture.jwtA);
    if (res.status !== 200 || res.data.valid !== true) {
      throw new Error(`[2] BOARDING validate: ${JSON.stringify(res.data)}`);
    }
    console.log("✓ [2] BOARDING → validate → valid true");

    // 3. BOARDING → consume → OK
    res = await boardingPost("/api/boarding/consume", adminCookie, fixture.jwtA);
    if (res.status !== 200 || res.data.valid !== true) {
      throw new Error(`[3] BOARDING consume: ${JSON.stringify(res.data)}`);
    }
    console.log("✓ [3] BOARDING → consume → OK");

    // 4. DEPARTED → validate autre résa → BOARDING_CLOSED
    await lifecyclePost(`/api/admin/trips/${fixture.tripId}/depart`, adminCookie);
    res = await boardingPost("/api/boarding/validate", adminCookie, fixture.jwtB);
    if (res.status !== 200 || res.data.reason !== "BOARDING_CLOSED") {
      throw new Error(`[4] DEPARTED validate: ${JSON.stringify(res.data)}`);
    }
    console.log("✓ [4] DEPARTED → validate (autre résa) → BOARDING_CLOSED");

    // 5. COMPLETED → validate → TRIP_COMPLETED
    await lifecyclePost(`/api/admin/trips/${fixture.tripId}/complete`, adminCookie);
    res = await boardingPost("/api/boarding/validate", adminCookie, fixture.jwtB);
    if (res.status !== 200 || res.data.reason !== "TRIP_COMPLETED") {
      throw new Error(`[5] COMPLETED validate: ${JSON.stringify(res.data)}`);
    }
    console.log("✓ [5] COMPLETED → validate → TRIP_COMPLETED");

    // 6. CANCELLED → validate → TRIP_CANCELLED (fixture dédiée)
    const cancelFixture = await createBoardingFixture(adminCookie);
    try {
      await lifecyclePost(`/api/admin/trips/${cancelFixture.tripId}/cancel`, adminCookie, {
        reason: "Annulation test verify OPS-03B lifecycle",
      });
      res = await boardingPost("/api/boarding/validate", adminCookie, cancelFixture.jwtA);
      if (res.status !== 200 || res.data.reason !== "TRIP_CANCELLED") {
        throw new Error(`[6] CANCELLED validate: ${JSON.stringify(res.data)}`);
      }
      console.log("✓ [6] CANCELLED → validate → TRIP_CANCELLED");
    } finally {
      await cleanupFixture(adminCookie, cancelFixture);
    }

    console.log("\nOPS-03B boarding lifecycle verify OK (6/6)");
  } finally {
    await cleanupFixture(adminCookie, fixture);
  }
}

main().catch((e) => {
  console.error("OPS-03B VERIFY FAILED:", e.message);
  process.exit(1);
});
