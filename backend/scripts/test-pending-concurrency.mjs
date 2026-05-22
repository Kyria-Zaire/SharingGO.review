/**
 * S1-T3 — Preuve concurrence dernier siège.
 * Prérequis (via SQL sur le trip cible) :
 *   - totalSeats = 1
 *   - aucune Reservation CONFIRMED/USED
 *   - aucune PendingReservation active
 *
 * Usage:
 *   TRIP_ID=xxx node scripts/test-pending-concurrency.mjs
 *   node scripts/test-pending-concurrency.mjs [baseUrl]
 */

const baseUrl = process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3000";
const tripId = process.env.TRIP_ID;

async function login(email, password) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error(`Login failed for ${email}: ${res.status}`);
  return cookie;
}

async function register(email, password) {
  await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName: "Race", lastName: "User" }),
  });
}

async function createPending(tripId, cookie) {
  const res = await fetch(`${baseUrl}/api/reservations/pending`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ tripId }),
  });
  const json = await res.json();
  return { status: res.status, code: json.error?.code, body: json };
}

async function main() {
  if (!tripId) {
    console.error("Set TRIP_ID environment variable (trip prepared with totalSeats=1, no occupants).");
    process.exit(1);
  }

  const suffix = Date.now();
  const password = "TestPass123!";
  const emailA = `race-a-${suffix}@example.com`;
  const emailB = `race-b-${suffix}@example.com`;

  await register(emailA, password);
  await register(emailB, password);

  const [cookieA, cookieB] = await Promise.all([
    login(emailA, password),
    login(emailB, password),
  ]);

  const [resultA, resultB] = await Promise.all([
    createPending(tripId, cookieA),
    createPending(tripId, cookieB),
  ]);

  console.log("Trip:", tripId);
  console.log("User A:", resultA.status, resultA.code ?? "CREATED", resultA.body.pendingReservationId ?? "");
  console.log("User B:", resultB.status, resultB.code ?? "CREATED", resultB.body.pendingReservationId ?? "");

  const oneCreated =
    (resultA.status === 201 && resultB.status === 409 && resultB.code === "TRIP_FULL") ||
    (resultB.status === 201 && resultA.status === 409 && resultA.code === "TRIP_FULL");

  if (oneCreated) {
    console.log("PASS: exactly one pending created, one TRIP_FULL (no overbooking).");
    process.exit(0);
  }

  if (resultA.status === 201 && resultB.status === 201) {
    console.error("FAIL: both pending created — overbooking risk.");
    process.exit(1);
  }

  console.error("UNEXPECTED:", resultA, resultB);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
