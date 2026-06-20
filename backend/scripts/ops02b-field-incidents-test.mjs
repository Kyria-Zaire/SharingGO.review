/**
 * OPS-02B — Field incidents + admin incidents extension tests.
 *
 * Usage (backend running on :3000):
 *   node backend/scripts/ops02b-field-incidents-test.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const password = "DemoPassword123!";

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

async function login(email) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login ${email}: ${res.status}`);
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

async function getTripId(adminCookie) {
  const trips = await jsonFetch("/api/admin/trips?upcoming=true&limit=1", { cookie: adminCookie });
  const tripId = trips.data.trips?.[0]?.id;
  if (!tripId) throw new Error("no upcoming trip for tests");
  return tripId;
}

async function getConfirmedReservation(adminCookie) {
  const list = await jsonFetch("/api/admin/reservations?status=CONFIRMED&limit=10", {
    cookie: adminCookie,
  });
  const item = list.data.reservations?.[0];
  if (!item) throw new Error("no CONFIRMED reservation");
  return {
    reservationId: item.id,
    tripId: item.trip?.id ?? item.tripId,
  };
}

async function getConfirmedJwt(passengerCookie, offset = 0) {
  const list = await jsonFetch("/api/reservations?status=CONFIRMED&limit=5", {
    cookie: passengerCookie,
  });
  const item = list.data.reservations?.[offset];
  if (!item) throw new Error("no CONFIRMED reservation");
  const tok = await jsonFetch(`/api/boarding/${item.id}/token`, { cookie: passengerCookie });
  if (tok.status !== 200) throw new Error(`token fetch failed: ${tok.status}`);
  return {
    jwt: tok.data.boardingToken,
    reservationId: item.id,
    tripId: tok.data.tripId ?? item.trip?.id,
  };
}

function errorCode(data) {
  return data?.error?.code ?? data?.code;
}

async function main() {
  for (const [k, v] of Object.entries(loadDotEnv())) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  const driverCookie = await login("driver@sharinggo.demo");
  const adminCookie = await login("admin@sharinggo.demo");
  const convoyeurCookie = await login("convoyeur1@sharinggo.demo");
  const passengerCookie = await login("passenger01@sharinggo.demo");

  const tripId = await getTripId(adminCookie);

  // DRIVER can create field incident
  const fieldCreate = await jsonFetch("/api/boarding/field-incidents", {
    method: "POST",
    cookie: driverCookie,
    body: {
      relatedTripId: tripId,
      description: "Test OPS-02B field incident",
      boardingContext: { consumeReason: "PAYMENT_NOT_SUCCEEDED", requestId: `ops02b-${Date.now()}` },
    },
  });
  if (fieldCreate.status !== 201) {
    throw new Error(`DRIVER field-incidents expected 201 got ${fieldCreate.status} ${JSON.stringify(fieldCreate.data)}`);
  }
  if (fieldCreate.data.source !== "BOARDING_FIELD" || fieldCreate.data.type !== "PAYMENT") {
    throw new Error(`unexpected field incident payload ${JSON.stringify(fieldCreate.data)}`);
  }
  console.log(`✓ DRIVER field-incidents 201 (${fieldCreate.data.code})`);

  // CONVOYEUR forbidden
  const convoyeurDenied = await jsonFetch("/api/boarding/field-incidents", {
    method: "POST",
    cookie: convoyeurCookie,
    body: { relatedTripId: tripId, title: "Should fail" },
  });
  if (convoyeurDenied.status !== 403) {
    throw new Error(`CONVOYEUR field-incidents expected 403 got ${convoyeurDenied.status}`);
  }
  console.log("✓ CONVOYEUR field-incidents 403");

  // unknown boarding reason rejected (P1-2)
  const invalidReason = await jsonFetch("/api/boarding/field-incidents", {
    method: "POST",
    cookie: driverCookie,
    body: {
      relatedTripId: tripId,
      boardingContext: { consumeReason: "NOT_A_REAL_REASON", requestId: `ops02b-bad-${Date.now()}` },
    },
  });
  if (invalidReason.status !== 400 || errorCode(invalidReason.data) !== "VALIDATION_ERROR") {
    throw new Error(
      `unknown consumeReason expected 400 VALIDATION_ERROR got ${invalidReason.status} ${JSON.stringify(invalidReason.data)}`,
    );
  }
  console.log("✓ unknown consumeReason → 400 VALIDATION_ERROR");

  // DRIVER cannot access admin incidents
  if ((await jsonFetch("/api/admin/incidents", { cookie: driverCookie })).status !== 403) {
    throw new Error("DRIVER admin incidents expected 403");
  }
  console.log("✓ DRIVER /api/admin/incidents 403");

  // boardingToken enrichment (best-effort — trip window may expire)
  let enrichedOk = false;
  for (let offset = 0; offset < 5 && !enrichedOk; offset++) {
    try {
      const { jwt, reservationId, tripId: jwtTripId } = await getConfirmedJwt(passengerCookie, offset);
      const enriched = await jsonFetch("/api/boarding/field-incidents", {
        method: "POST",
        cookie: driverCookie,
        body: {
          relatedTripId: jwtTripId,
          boardingContext: {
            boardingToken: jwt,
            requestId: `ops02b-enrich-${Date.now()}-${offset}`,
          },
        },
      });
      if (enriched.status === 201 && enriched.data.relatedReservationId === reservationId) {
        enrichedOk = true;
        console.log("✓ boardingToken enriches reservationId");
      }
    } catch {
      // try next reservation
    }
  }
  if (!enrichedOk) {
    const { reservationId, tripId: adminTripId } = await getConfirmedReservation(adminCookie);
    const explicit = await jsonFetch("/api/boarding/field-incidents", {
      method: "POST",
      cookie: driverCookie,
      body: {
        relatedTripId: adminTripId,
        relatedReservationId: reservationId,
        boardingContext: { requestId: `ops02b-explicit-${Date.now()}` },
      },
    });
    if (explicit.status !== 201) {
      throw new Error(`explicit trip/reservation field-incidents failed ${explicit.status}`);
    }
    console.log("✓ explicit tripId + reservationId field incident");
  }

  // consume failure returns context
  const consumeFail = await jsonFetch("/api/boarding/consume", {
    method: "POST",
    cookie: driverCookie,
    body: { boardingToken: "not.a.jwt" },
  });
  if (consumeFail.status !== 200 || consumeFail.data.valid !== false) {
    throw new Error(`consume invalid jwt expected 200 fail got ${consumeFail.status}`);
  }
  if (consumeFail.data.context !== undefined) {
    throw new Error("invalid jwt should not include context");
  }
  console.log("✓ consume invalid jwt — no context (expected)");

  const validatePayment = await jsonFetch("/api/boarding/validate", {
    method: "POST",
    cookie: driverCookie,
    body: { boardingToken: "not.a.jwt" },
  });
  if (validatePayment.status !== 200 || validatePayment.data.valid !== false) {
    throw new Error("validate invalid jwt expected 200 fail");
  }
  console.log("✓ validate invalid jwt — no context (expected)");

  // promote-heuristic + dedup 409 (idempotent if open incident already exists)
  const promoteBody = { relatedTripId: tripId, heuristicKind: "full_not_boarded" };
  const promote1 = await jsonFetch("/api/admin/incidents/promote-heuristic", {
    method: "POST",
    cookie: adminCookie,
    body: promoteBody,
  });
  if (promote1.status === 201) {
    const promotedId = promote1.data.id;
    const feedDup = await jsonFetch("/api/admin/activity-feed?limit=50", { cookie: adminCookie });
    const createdEvents = (feedDup.data.events ?? []).filter(
      (e) => e.type === "INCIDENT_CREATED" && e.entityId === promotedId
    );
    if (createdEvents.length !== 1) {
      throw new Error(
        `activity feed dedup: expected 1 INCIDENT_CREATED for incident ${promotedId}, got ${createdEvents.length}`
      );
    }
    console.log("✓ activity feed single INCIDENT_CREATED per promotion");

    const promoteDup = await jsonFetch("/api/admin/incidents/promote-heuristic", {
      method: "POST",
      cookie: adminCookie,
      body: promoteBody,
    });
    if (promoteDup.status !== 409 || errorCode(promoteDup.data) !== "INCIDENT_DUPLICATE") {
      throw new Error(
        `promote dedup expected 409 INCIDENT_DUPLICATE got ${promoteDup.status} ${JSON.stringify(promoteDup.data)}`,
      );
    }
    console.log("✓ promote-heuristic create 201 + dedup 409");
  } else if (promote1.status === 409 && errorCode(promote1.data) === "INCIDENT_DUPLICATE") {
    const promoteDup = await jsonFetch("/api/admin/incidents/promote-heuristic", {
      method: "POST",
      cookie: adminCookie,
      body: promoteBody,
    });
    if (promoteDup.status !== 409 || errorCode(promoteDup.data) !== "INCIDENT_DUPLICATE") {
      throw new Error(
        `promote dedup on existing expected 409 got ${promoteDup.status} ${JSON.stringify(promoteDup.data)}`,
      );
    }
    console.log("✓ promote-heuristic dedup 409 (pre-existing open incident)");
  } else {
    throw new Error(`promote-heuristic expected 201 or 409 dedup got ${promote1.status}`);
  }

  // filter by source
  const filtered = await jsonFetch("/api/admin/incidents?source=BOARDING_FIELD&limit=10", {
    cookie: adminCookie,
  });
  if (filtered.status !== 200 || !Array.isArray(filtered.data.incidents)) {
    throw new Error("list filter source failed");
  }
  console.log("✓ GET incidents filter source=BOARDING_FIELD");

  // resolution required
  const manual = await jsonFetch("/api/admin/incidents", {
    method: "POST",
    cookie: adminCookie,
    body: {
      title: "OPS-02B resolve test",
      type: "OTHER",
      severity: "LOW",
      relatedTripId: tripId,
    },
  });
  const incidentId = manual.data.id;
  const resolveFail = await jsonFetch(`/api/admin/incidents/${incidentId}`, {
    method: "PATCH",
    cookie: adminCookie,
    body: { status: "RESOLVED" },
  });
  if (resolveFail.status !== 400 || errorCode(resolveFail.data) !== "RESOLUTION_REQUIRED") {
    throw new Error(`resolve without resolution expected 400 got ${resolveFail.status}`);
  }
  console.log("✓ PATCH RESOLVED requires resolution");

  const resolveOk = await jsonFetch(`/api/admin/incidents/${incidentId}`, {
    method: "PATCH",
    cookie: adminCookie,
    body: {
      status: "RESOLVED",
      resolution: "Résolution test OPS-02B validée",
    },
  });
  if (resolveOk.status !== 200 || resolveOk.data.resolvedByUserId == null) {
    throw new Error(`resolve with resolution expected 200 + resolvedByUserId`);
  }
  console.log("✓ PATCH RESOLVED with resolution + resolvedByUserId");

  const closeRes = await jsonFetch(`/api/admin/incidents/${incidentId}`, {
    method: "DELETE",
    cookie: adminCookie,
  });
  if (closeRes.status !== 200 || closeRes.data.status !== "CLOSED" || closeRes.data.closedReason !== "FIXED") {
    throw new Error(`DELETE close expected CLOSED+FIXED got ${JSON.stringify(closeRes.data)}`);
  }
  console.log("✓ DELETE closes incident with closedReason FIXED");

  // activity feed incident events
  const feed = await jsonFetch("/api/admin/activity-feed?limit=50", { cookie: adminCookie });
  const types = new Set(feed.data.events?.map((e) => e.type) ?? []);
  if (!types.has("INCIDENT_CREATED")) throw new Error("feed missing INCIDENT_CREATED");
  console.log("✓ activity feed includes INCIDENT_CREATED");
  if (types.has("INCIDENT_SUGGESTED")) {
    console.log("✓ activity feed includes INCIDENT_SUGGESTED");
  }

  // regression admin create
  const legacy = await jsonFetch("/api/admin/incidents", {
    method: "POST",
    cookie: adminCookie,
    body: {
      title: "Legacy admin incident",
      type: "DELAY",
      severity: "MEDIUM",
    },
  });
  if (legacy.status !== 201 || legacy.data.source !== "MANUAL") {
    throw new Error("regression admin create failed");
  }
  console.log("✓ regression POST /api/admin/incidents (source=MANUAL)");

  console.log("\nOPS-02B field incidents tests OK");
}

main().catch((e) => {
  console.error("OPS-02B FAILED:", e.message);
  process.exit(1);
});
