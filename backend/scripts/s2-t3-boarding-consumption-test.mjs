/**
 * S2-T3 — Boarding consumption API + concurrency tests.
 *
 * Usage (repo root):
 *   node backend/scripts/s2-t3-boarding-consumption-test.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

const FORBIDDEN = ["email", "stripePaymentIntentId", "boardingToken", '"bt"'];

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
    { encoding: "utf8" }
  );
}

function assertSafe(label, obj) {
  const json = JSON.stringify(obj);
  for (const key of FORBIDDEN) {
    if (json.includes(key)) throw new Error(`${label}: leaked ${key}`);
  }
}

async function login(email, password) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`login ${email}: ${res.status}`);
  return res.headers.get("set-cookie").split(";")[0];
}

async function getConfirmedReservationJwt(passengerCookie, offset = 0) {
  const list = await fetch(`${baseUrl}/api/reservations?status=CONFIRMED&limit=10`, {
    headers: { cookie: passengerCookie },
  });
  const data = await list.json();
  const item = data.reservations?.[offset];
  if (!item) throw new Error("no CONFIRMED reservation");
  const tok = await fetch(`${baseUrl}/api/boarding/${item.id}/token`, {
    headers: { cookie: passengerCookie },
  });
  const body = await tok.json();
  if (!tok.ok) throw new Error(`token ${item.id}: ${tok.status}`);
  return { jwt: body.boardingToken, reservationId: item.id, tripId: body.tripId };
}

async function consume(cookie, jwt) {
  const res = await fetch(`${baseUrl}/api/boarding/consume`, {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ boardingToken: jwt }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function assertFail(body, reason) {
  if (body.valid !== false || body.consumed !== false || body.reason !== reason) {
    throw new Error(`expected fail ${reason} got ${JSON.stringify(body)}`);
  }
}

async function main() {
  const dotenv = loadDotEnv();
  for (const [k, v] of Object.entries(dotenv)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  const password = "DemoPassword123!";
  const adminCookie = await login("admin@sharinggo.demo", password);
  const passengerCookie = await login("passenger01@sharinggo.demo", password);
  const convoyeurCookie = await login("convoyeur1@sharinggo.demo", password);
  const passenger02Cookie = await login("passenger02@sharinggo.demo", password);
  const passenger03Cookie = await login("passenger03@sharinggo.demo", password);

  const main = await getConfirmedReservationJwt(passengerCookie, 0);
  const parallel = await getConfirmedReservationJwt(passengerCookie, 1);
  const tripCase = await getConfirmedReservationJwt(passenger02Cookie, 0);
  const payCase = await getConfirmedReservationJwt(passenger03Cookie, 0);
  const revokeCase = await getConfirmedReservationJwt(passengerCookie, 2);

  const { jwt, reservationId } = main;

  const tampered = `${jwt}x`;
  assertFail((await consume(adminCookie, tampered)).body, "INVALID_TOKEN");
  console.log("✓ JWT altéré → INVALID_TOKEN");

  const jwtUrl = pathToFileURL(
    join(__dirname, "..", "dist", "modules", "boarding", "boarding-jwt.js")
  ).href;
  const { signBoardingJwt } = await import(jwtUrl);
  const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString("utf8"));
  const expiredJwt = signBoardingJwt({
    ...payload,
    typ: "boarding",
    iat: Math.floor(Date.now() / 1000) - 7200,
    exp: Math.floor(Date.now() / 1000) - 3600,
  });
  assertFail((await consume(adminCookie, expiredJwt)).body, "EXPIRED_TOKEN");
  console.log("✓ JWT expiré → EXPIRED_TOKEN");

  psql(`UPDATE "Trip" SET "deletedAt"=NOW() WHERE id='${tripCase.tripId}';`);
  assertFail((await consume(adminCookie, tripCase.jwt)).body, "TRIP_DISABLED");
  psql(`UPDATE "Trip" SET "deletedAt"=NULL WHERE id='${tripCase.tripId}';`);
  console.log("✓ trip disabled → TRIP_DISABLED");

  const payId = psql(`SELECT id FROM "Payment" WHERE "reservationId"='${payCase.reservationId}';`).trim();
  if (payId) {
    const oldPay = psql(`SELECT status FROM "Payment" WHERE id='${payId}';`).trim();
    psql(`UPDATE "Payment" SET status='FAILED' WHERE id='${payId}';`);
    assertFail((await consume(adminCookie, payCase.jwt)).body, "PAYMENT_NOT_SUCCEEDED");
    psql(`UPDATE "Payment" SET status='${oldPay}' WHERE id='${payId}';`);
    console.log("✓ payment failed → PAYMENT_NOT_SUCCEEDED");
  }

  if ((await consume("", jwt)).status !== 401) throw new Error("expected 401");
  console.log("✓ sans auth → 401");

  if ((await consume(convoyeurCookie, jwt)).status !== 403) throw new Error("expected 403");
  console.log("✓ convoyeur → 403");

  const [p1, p2] = await Promise.all([
    consume(adminCookie, parallel.jwt),
    consume(adminCookie, parallel.jwt),
  ]);
  const consumedParallel = [p1, p2].filter((r) => r.body.consumed === true);
  const alreadyParallel = [p1, p2].filter((r) => r.body.reason === "BOARDING_ALREADY_USED");
  if (consumedParallel.length !== 1 || alreadyParallel.length !== 1) {
    throw new Error(`parallel: ${JSON.stringify([p1.body, p2.body])}`);
  }
  const parallelUsed = psql(
    `SELECT COUNT(*) FROM "Reservation" WHERE id='${parallel.reservationId}' AND status='USED';`
  ).trim();
  if (parallelUsed !== "1") throw new Error("parallel DB must have exactly one USED");
  console.log("✓ scans parallèles → 1 consumed + 1 BOARDING_ALREADY_USED");

  const first = await consume(adminCookie, jwt);
  if (first.status !== 200 || first.body.valid !== true || first.body.consumed !== true) {
    throw new Error(`consume valid failed: ${JSON.stringify(first.body)}`);
  }
  if (first.body.reservation.status !== "USED" || !first.body.reservation.usedAt) {
    throw new Error("expected USED + usedAt");
  }
  assertSafe("consume success", first.body);
  const usedCount = psql(`SELECT COUNT(*) FROM "Reservation" WHERE id='${reservationId}' AND status='USED';`).trim();
  if (usedCount !== "1") throw new Error("DB not USED once");
  console.log("✓ consume valide → USED + consumed=true");

  const second = await consume(adminCookie, jwt);
  if (
    second.body.valid !== true ||
    second.body.consumed !== false ||
    second.body.reason !== "BOARDING_ALREADY_USED"
  ) {
    throw new Error(`second scan: ${JSON.stringify(second.body)}`);
  }
  console.log("✓ second scan → BOARDING_ALREADY_USED");

  const oldBt = psql(
    `SELECT "boardingToken" FROM "Reservation" WHERE id='${revokeCase.reservationId}';`
  ).trim();
  psql(
    `UPDATE "Reservation" SET "boardingToken"='revoked_${Date.now()}' WHERE id='${revokeCase.reservationId}';`
  );
  assertFail((await consume(adminCookie, revokeCase.jwt)).body, "TOKEN_REVOKED");
  psql(
    `UPDATE "Reservation" SET "boardingToken"='${oldBt}' WHERE id='${revokeCase.reservationId}';`
  );
  console.log("✓ token révoqué → TOKEN_REVOKED");

  console.log("\nS2-T3 boarding consumption tests OK");
}

main().catch((e) => {
  console.error("S2-T3 FAILED:", e.message);
  process.exit(1);
});
