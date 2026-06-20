/**
 * OPS-03B — Trip lifecycle backend tests.
 *
 * Usage (backend on :3000, postgres container sharinggo-postgres-dev):
 *   node backend/scripts/ops03b-lifecycle-test.mjs
 */
import { execFileSync } from "node:child_process";
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

function psql(sql) {
  return execFileSync(
    "docker",
    ["exec", "sharinggo-postgres-dev", "psql", "-U", "postgres", "-d", "sharinggo", "-tAc", sql],
    { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
  );
}

async function login(email) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`login ${email}: ${res.status} ${JSON.stringify(body)}`);
  const cookie = res.headers.get("set-cookie");
  if (!cookie) throw new Error("missing cookie");
  return cookie.split(";")[0];
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

async function getDedicatedTrip(adminCookie) {
  const lines = await jsonFetch("/api/admin/lines?limit=1", { cookie: adminCookie });
  const lineId = lines.data.lines?.[0]?.id;
  if (!lineId) throw new Error("no line for test trip");

  const departure = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
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
  if (created.status !== 201) {
    throw new Error(`create trip failed: ${created.status} ${JSON.stringify(created.data)}`);
  }
  return created.data.trip.id;
}

function resetTripLifecycle(tripId) {
  psql(`
    UPDATE "Trip"
    SET "lifecycleStatus"='WAITING',
        "boardingStartedAt"=NULL,
        "departedAt"=NULL,
        "completedAt"=NULL,
        "cancelledAt"=NULL,
        "cancellationReason"=NULL,
        "lifecycleUpdatedByUserId"=NULL
    WHERE id='${tripId}';
  `);
}

async function bookWithSubscription(passengerCookie, tripId) {
  const res = await jsonFetch("/api/reservations/book-with-subscription", {
    method: "POST",
    cookie: passengerCookie,
    body: { tripId },
  });
  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`book-with-subscription failed: ${res.status}`);
  }
  return res.data.reservation?.id;
}

async function getBoardingJwt(passengerCookie, reservationId) {
  const tok = await jsonFetch(`/api/boarding/${reservationId}/token`, { cookie: passengerCookie });
  if (tok.status !== 200) throw new Error(`boarding token: ${tok.status}`);
  return tok.data.boardingToken;
}

async function createBoardingFixture(adminCookie) {
  const tripId = await getDedicatedTrip(adminCookie);
  const mosolfCookie = await login("mosolf-active@sharinggo.demo");
  const resAId = await bookWithSubscription(mosolfCookie, tripId);
  const jwt = await getBoardingJwt(mosolfCookie, resAId);
  return { tripId, jwt };
}

async function cleanupBoardingFixture(adminCookie, fixture) {
  await jsonFetch(`/api/admin/trips/${fixture.tripId}/disable`, {
    method: "POST",
    cookie: adminCookie,
  });
}

async function lifecyclePost(path, cookie, body) {
  const res = await jsonFetch(path, { method: "POST", cookie, body });
  await sleep(150);
  return res;
}

async function validateBoarding(adminCookie, jwt) {
  return jsonFetch("/api/boarding/validate", {
    method: "POST",
    cookie: adminCookie,
    body: { boardingToken: jwt },
  });
}

async function main() {
  const dotenv = loadDotEnv();
  for (const [k, v] of Object.entries(dotenv)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  const adminCookie = await login("admin@sharinggo.demo");
  const convoyeurCookie = await login("convoyeur1@sharinggo.demo");
  const driverCookie = await login("driver@sharinggo.demo");

  const tripA = await getDedicatedTrip(adminCookie);
  const tripB = await getDedicatedTrip(adminCookie);
  const tripC = await getDedicatedTrip(adminCookie);

  try {
    // WAITING → BOARDING
    let res = await lifecyclePost(`/api/admin/trips/${tripA}/start-boarding`, adminCookie);
    if (res.status !== 200 || res.data.trip?.lifecycleStatus !== "BOARDING") {
      throw new Error(`start-boarding failed: ${JSON.stringify(res)}`);
    }
    console.log("✓ WAITING → BOARDING");

    // BOARDING → DEPARTED
    res = await lifecyclePost(`/api/admin/trips/${tripA}/depart`, adminCookie);
    if (res.status !== 200 || res.data.trip?.lifecycleStatus !== "DEPARTED") {
      throw new Error(`depart failed: ${JSON.stringify(res)}`);
    }
    console.log("✓ BOARDING → DEPARTED");

    // DEPARTED → COMPLETED
    res = await lifecyclePost(`/api/admin/trips/${tripA}/complete`, adminCookie);
    if (res.status !== 200 || res.data.trip?.lifecycleStatus !== "COMPLETED") {
      throw new Error(`complete failed: ${JSON.stringify(res)}`);
    }
    console.log("✓ DEPARTED → COMPLETED");

    // COMPLETED → * refused
    res = await lifecyclePost(`/api/admin/trips/${tripA}/start-boarding`, adminCookie);
    if (res.status !== 409 || res.data.error?.code !== "INVALID_LIFECYCLE_TRANSITION") {
      throw new Error(`COMPLETED transition should 409: ${JSON.stringify(res)}`);
    }
    console.log("✓ COMPLETED → * refusé");

    // WAITING → CANCELLED
    resetTripLifecycle(tripB);
    res = await lifecyclePost(`/api/admin/trips/${tripB}/cancel`, adminCookie, {
      reason: "Conditions météo défavorables annulation test",
    });
    if (res.status !== 200 || res.data.trip?.lifecycleStatus !== "CANCELLED") {
      throw new Error(`cancel WAITING failed: ${JSON.stringify(res)}`);
    }
    console.log("✓ WAITING → CANCELLED");

    // BOARDING → CANCELLED
    resetTripLifecycle(tripC);
    await lifecyclePost(`/api/admin/trips/${tripC}/start-boarding`, adminCookie);
    res = await lifecyclePost(`/api/admin/trips/${tripC}/cancel`, adminCookie, {
      reason: "Panne véhicule signalée terrain",
    });
    if (res.status !== 200 || res.data.trip?.lifecycleStatus !== "CANCELLED") {
      throw new Error(`cancel BOARDING failed: ${JSON.stringify(res)}`);
    }
    console.log("✓ BOARDING → CANCELLED");

    // cancel reason too short
    resetTripLifecycle(tripB);
    res = await lifecyclePost(`/api/admin/trips/${tripB}/cancel`, adminCookie, { reason: "court" });
    if (res.status !== 400) {
      throw new Error(`short cancel reason should 400: ${JSON.stringify(res)}`);
    }
    console.log("✓ cancel reason < 10 caractères refusé");

    // invalid transitions on fresh trip
    const tripD = await getDedicatedTrip(adminCookie);
    try {
      res = await lifecyclePost(`/api/admin/trips/${tripD}/complete`, adminCookie);
      if (res.status !== 409) {
        throw new Error(`WAITING → COMPLETED should 409: ${JSON.stringify(res)}`);
      }
      console.log("✓ WAITING → COMPLETED refusé");

      await lifecyclePost(`/api/admin/trips/${tripD}/start-boarding`, adminCookie);
      res = await lifecyclePost(`/api/admin/trips/${tripD}/complete`, adminCookie);
      if (res.status !== 409) {
        throw new Error(`BOARDING → COMPLETED should 409: ${JSON.stringify(res)}`);
      }
      console.log("✓ BOARDING → COMPLETED direct refusé");

      await lifecyclePost(`/api/admin/trips/${tripD}/depart`, adminCookie);
      res = await lifecyclePost(`/api/admin/trips/${tripD}/start-boarding`, adminCookie);
      if (res.status !== 409) {
        throw new Error(`DEPARTED → BOARDING should 409: ${JSON.stringify(res)}`);
      }
      console.log("✓ DEPARTED → BOARDING refusé");
    } finally {
      resetTripLifecycle(tripD);
      psql(`DELETE FROM "Trip" WHERE id='${tripD}';`);
    }

    // RBAC — convoyeur / driver forbidden
    const tripE = await getDedicatedTrip(adminCookie);
    try {
      res = await jsonFetch(`/api/admin/trips/${tripE}/start-boarding`, {
        method: "POST",
        cookie: convoyeurCookie,
      });
      if (res.status !== 403) {
        throw new Error(`convoyeur lifecycle expected 403 got ${res.status}`);
      }
      res = await jsonFetch(`/api/admin/trips/${tripE}/start-boarding`, {
        method: "POST",
        cookie: driverCookie,
      });
      if (res.status !== 403) {
        throw new Error(`driver lifecycle expected 403 got ${res.status}`);
      }
      console.log("✓ PASSENGER/CONVOYEUR/DRIVER non autorisés sur admin lifecycle");
    } finally {
      resetTripLifecycle(tripE);
      psql(`DELETE FROM "Trip" WHERE id='${tripE}';`);
    }

    // Boarding validate lifecycle gates — fixture API (abonnement)
    const boardingFixture = await createBoardingFixture(adminCookie);
    try {
      resetTripLifecycle(boardingFixture.tripId);

      let boarding = await validateBoarding(adminCookie, boardingFixture.jwt);
      if (boarding.status !== 200 || boarding.data.reason !== "BOARDING_NOT_STARTED") {
        throw new Error(`WAITING validate expected BOARDING_NOT_STARTED: ${JSON.stringify(boarding)}`);
      }
      console.log("✓ boarding validate refusé en WAITING");

      await lifecyclePost(`/api/admin/trips/${boardingFixture.tripId}/start-boarding`, adminCookie);
      boarding = await validateBoarding(adminCookie, boardingFixture.jwt);
      if (boarding.status !== 200 || boarding.data.valid !== true) {
        throw new Error(`BOARDING validate expected valid true: ${JSON.stringify(boarding)}`);
      }
      console.log("✓ boarding validate OK en BOARDING");

      await lifecyclePost(`/api/admin/trips/${boardingFixture.tripId}/depart`, adminCookie);
      boarding = await validateBoarding(adminCookie, boardingFixture.jwt);
      if (boarding.status !== 200 || boarding.data.reason !== "BOARDING_CLOSED") {
        throw new Error(`DEPARTED validate expected BOARDING_CLOSED: ${JSON.stringify(boarding)}`);
      }
      console.log("✓ boarding validate refusé en DEPARTED");
    } finally {
      await cleanupBoardingFixture(adminCookie, boardingFixture);
    }

    console.log("  → verify complet : node backend/scripts/ops03b-boarding-lifecycle-verify.mjs");

    // Audit events
    const feed = await jsonFetch("/api/admin/activity-feed?limit=100", { cookie: adminCookie });
    const lifecycleActions = new Set([
      "TRIP_BOARDING_STARTED",
      "TRIP_DEPARTED",
      "TRIP_COMPLETED",
      "TRIP_CANCELLED",
    ]);
    const tripIds = new Set([tripA, tripB, tripC]);
    const lifecycleEvents = (feed.data.events ?? []).filter(
      (event) => lifecycleActions.has(event.type) && tripIds.has(event.entityId)
    );
    if (lifecycleEvents.length < 4) {
      throw new Error(`expected lifecycle audit events, got count=${lifecycleEvents.length}`);
    }
    console.log("✓ audit TRIP_* events créés");

    console.log("\nOPS-03B lifecycle tests OK");
  } finally {
    resetTripLifecycle(tripA);
    resetTripLifecycle(tripB);
    resetTripLifecycle(tripC);
    psql(`DELETE FROM "Trip" WHERE id IN ('${tripA}','${tripB}','${tripC}');`);
  }
}

main().catch((e) => {
  console.error("OPS-03B FAILED:", e.message);
  process.exit(1);
});
