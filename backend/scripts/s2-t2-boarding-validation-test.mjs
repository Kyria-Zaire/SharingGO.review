/**
 * S2-T2 — Boarding token validation API tests.
 *
 * Usage (repo root):
 *   node backend/scripts/s2-t2-boarding-validation-test.mjs
 */
import { createHmac } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

const FORBIDDEN = [
  "email",
  "stripePaymentIntentId",
  "stripeCheckoutSessionId",
  "boardingToken",
  '"bt"',
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

function signRawPayload(payloadObj, secret) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");
  const sig = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}

function psql(sql) {
  return execFileSync(
    "docker",
    ["exec", "sharinggo-postgres-dev", "psql", "-U", "postgres", "-d", "sharinggo", "-tAc", sql],
    { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
  );
}

function assertSafe(label, obj) {
  const json = JSON.stringify(obj);
  for (const key of FORBIDDEN) {
    if (json.includes(key)) throw new Error(`${label}: leaked forbidden key ${key}`);
  }
}

async function login(email, password) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`login ${email}: ${res.status} ${JSON.stringify(body)}`);
  const cookie = res.headers.get("set-cookie");
  if (!cookie) throw new Error("missing cookie");
  return cookie.split(";")[0];
}

async function getPassengerJwt(cookie) {
  const list = await fetch(`${baseUrl}/api/reservations?status=CONFIRMED&limit=1`, {
    headers: { cookie },
  });
  const data = await list.json();
  const id = data.reservations?.[0]?.id;
  if (!id) throw new Error("no confirmed reservation");
  const tok = await fetch(`${baseUrl}/api/boarding/${id}/token`, { headers: { cookie } });
  const body = await tok.json();
  if (!tok.ok) throw new Error(`get token: ${tok.status}`);
  return { jwt: body.boardingToken, reservationId: id, tripId: body.tripId };
}

async function validate(cookie, jwt) {
  const res = await fetch(`${baseUrl}/api/boarding/validate`, {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ boardingToken: jwt }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function assertInvalid(body, reason) {
  if (body.valid !== false || body.reason !== reason) {
    throw new Error(`expected valid=false reason=${reason} got ${JSON.stringify(body)}`);
  }
}

async function main() {
  const dotenv = loadDotEnv();
  for (const [k, v] of Object.entries(dotenv)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
  const boardingSecret = process.env.BOARDING_JWT_SECRET ?? dotenv.BOARDING_JWT_SECRET;
  if (!boardingSecret || boardingSecret.length < 32) {
    throw new Error("BOARDING_JWT_SECRET missing or too short");
  }

  const jwtUrl = pathToFileURL(
    join(__dirname, "..", "dist", "modules", "boarding", "boarding-jwt.js")
  ).href;
  const { signBoardingJwt } = await import(jwtUrl);

  const password = "DemoPassword123!";
  const adminCookie = await login("admin@sharinggo.demo", password);
  const passengerCookie = await login("passenger01@sharinggo.demo", password);
  const convoyeurCookie = await login("convoyeur1@sharinggo.demo", password);

  const { jwt, reservationId, tripId } = await getPassengerJwt(passengerCookie);
  const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString("utf8"));

  const ok = await validate(adminCookie, jwt);
  if (ok.status !== 200 || ok.body.valid !== true) {
    throw new Error(`admin valid token failed: ${JSON.stringify(ok.body)}`);
  }
  assertSafe("valid response", ok.body);
  console.log("✓ admin valid token → valid true");

  const noAuth = await validate("", jwt);
  if (noAuth.status !== 401) throw new Error(`no auth expected 401 got ${noAuth.status}`);
  console.log("✓ sans auth → 401");

  const convoyeur = await validate(convoyeurCookie, jwt);
  if (convoyeur.status !== 403) throw new Error(`convoyeur expected 403 got ${convoyeur.status}`);
  console.log("✓ convoyeur → 403");

  const tampered = `${jwt.slice(0, -2)}xx`;
  assertInvalid((await validate(adminCookie, tampered)).body, "INVALID_TOKEN");
  console.log("✓ JWT altéré → INVALID_TOKEN");

  const expiredJwt = signBoardingJwt({
    sub: payload.sub,
    typ: "boarding",
    uid: payload.uid,
    tid: payload.tid,
    bt: payload.bt,
    iat: Math.floor(Date.now() / 1000) - 7200,
    exp: Math.floor(Date.now() / 1000) - 3600,
  });
  assertInvalid((await validate(adminCookie, expiredJwt)).body, "EXPIRED_TOKEN");
  console.log("✓ JWT expiré → EXPIRED_TOKEN");

  const wrongTyp = signRawPayload(
    { ...payload, typ: "other" },
    boardingSecret
  );
  assertInvalid((await validate(adminCookie, wrongTyp)).body, "INVALID_TYPE");
  console.log("✓ typ invalide → INVALID_TYPE");

  const { bt: _bt, ...incompletePayload } = payload;
  const incompleteJwt = signRawPayload(incompletePayload, boardingSecret);
  assertInvalid((await validate(adminCookie, incompleteJwt)).body, "INVALID_PAYLOAD");
  console.log("✓ payload incomplet → INVALID_PAYLOAD");

  const oldBt = psql(`SELECT "boardingToken" FROM "Reservation" WHERE id='${reservationId}';`).trim();
  psql(`UPDATE "Reservation" SET "boardingToken"='revoked_${Date.now()}' WHERE id='${reservationId}';`);
  assertInvalid((await validate(adminCookie, jwt)).body, "TOKEN_REVOKED");
  psql(`UPDATE "Reservation" SET "boardingToken"='${oldBt}' WHERE id='${reservationId}';`);
  console.log("✓ bt différent DB → TOKEN_REVOKED");

  const oldStatus = psql(`SELECT status FROM "Reservation" WHERE id='${reservationId}';`).trim();
  psql(`UPDATE "Reservation" SET status='CANCELED' WHERE id='${reservationId}';`);
  assertInvalid((await validate(adminCookie, jwt)).body, "RESERVATION_NOT_CONFIRMED");
  psql(`UPDATE "Reservation" SET status='${oldStatus}' WHERE id='${reservationId}';`);
  console.log("✓ réservation non CONFIRMED → RESERVATION_NOT_CONFIRMED");

  const oldDeleted = psql(`SELECT "deletedAt" FROM "Trip" WHERE id='${tripId}';`).trim();
  psql(`UPDATE "Trip" SET "deletedAt"=NOW() WHERE id='${tripId}';`);
  assertInvalid((await validate(adminCookie, jwt)).body, "TRIP_DISABLED");
  psql(`UPDATE "Trip" SET "deletedAt"=${oldDeleted === "" ? "NULL" : `'${oldDeleted}'`} WHERE id='${tripId}';`);
  console.log("✓ trip disabled → TRIP_DISABLED");

  const futureExp = Math.floor(Date.now() / 1000) + 3600;
  const windowJwt = signBoardingJwt({
    sub: payload.sub,
    typ: "boarding",
    uid: payload.uid,
    tid: payload.tid,
    bt: payload.bt,
    iat: Math.floor(Date.now() / 1000),
    exp: futureExp,
  });
  const oldDep = psql(`SELECT "departureTime" FROM "Trip" WHERE id='${tripId}';`).trim();
  psql(`UPDATE "Trip" SET "departureTime"=NOW() - INTERVAL '2 hours' WHERE id='${tripId}';`);
  assertInvalid((await validate(adminCookie, windowJwt)).body, "BOARDING_WINDOW_EXPIRED");
  psql(`UPDATE "Trip" SET "departureTime"='${oldDep}' WHERE id='${tripId}';`);
  console.log("✓ boarding window passée → BOARDING_WINDOW_EXPIRED");

  const payId = psql(`SELECT id FROM "Payment" WHERE "reservationId"='${reservationId}';`).trim();
  if (payId) {
    const oldPay = psql(`SELECT status FROM "Payment" WHERE id='${payId}';`).trim();
    psql(`UPDATE "Payment" SET status='FAILED' WHERE id='${payId}';`);
    assertInvalid((await validate(adminCookie, jwt)).body, "PAYMENT_NOT_SUCCEEDED");
    psql(`UPDATE "Payment" SET status='${oldPay}' WHERE id='${payId}';`);
    console.log("✓ payment failed → PAYMENT_NOT_SUCCEEDED");
  }

  console.log("\nS2-T2 boarding validation tests OK");
}

main().catch((e) => {
  console.error("S2-T2 FAILED:", e.message);
  process.exit(1);
});
