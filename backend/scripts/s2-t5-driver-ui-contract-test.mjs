/**
 * S2-T5 — Driver scan UI contract on POST /api/boarding/consume.
 *
 * Usage (repo root):
 *   node backend/scripts/s2-t5-driver-ui-contract-test.mjs
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
  const parts = json.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g);
  if (parts?.length) throw new Error(`${label}: full JWT in response`);
}

function assertUi(body, expectedStatus, ctx) {
  const ui = body.ui;
  if (!ui || typeof ui.status !== "string" || !ui.title || !ui.message) {
    throw new Error(`${ctx}: missing ui block ${JSON.stringify(body)}`);
  }
  if (ui.status !== expectedStatus) {
    throw new Error(`${ctx}: expected ui.status=${expectedStatus} got ${ui.status} (${body.reason ?? "success"})`);
  }
}

async function login(email, password) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login ${email}: ${res.status}`);
  return res.headers.get("set-cookie").split(";")[0];
}

async function listConfirmedReservations(passengerCookie) {
  const list = await fetch(`${baseUrl}/api/reservations?status=CONFIRMED&limit=50`, {
    headers: { cookie: passengerCookie },
  });
  const data = await list.json();
  return data.reservations ?? [];
}

async function getConfirmedJwt(passengerCookie, skipReservationIds = new Set()) {
  const items = await listConfirmedReservations(passengerCookie);
  for (const item of items) {
    if (skipReservationIds.has(item.id)) continue;
    const tok = await fetch(`${baseUrl}/api/boarding/${item.id}/token`, {
      headers: { cookie: passengerCookie },
    });
    const body = await tok.json();
    if (!tok.ok) continue;
    return { jwt: body.boardingToken, reservationId: item.id };
  }
  throw new Error("no CONFIRMED reservation with boarding token");
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

async function main() {
  const dotenv = loadDotEnv();
  for (const [k, v] of Object.entries(dotenv)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  const password = "DemoPassword123!";
  const adminCookie = await login("admin@sharinggo.demo", password);
  const passengerCookie = await login("passenger01@sharinggo.demo", password);
  const convoyeurCookie = await login("convoyeur1@sharinggo.demo", password);

  const mainCase = await getConfirmedJwt(passengerCookie);
  const revokeCase = await getConfirmedJwt(passengerCookie, new Set([mainCase.reservationId]));
  const { jwt, reservationId } = mainCase;

  const tampered = await consume(adminCookie, `${jwt}x`);
  if (tampered.status !== 200) throw new Error(`tampered status ${tampered.status}`);
  assertUi(tampered.body, "error", "INVALID_TOKEN");
  if (tampered.body.reason !== "INVALID_TOKEN") throw new Error("expected INVALID_TOKEN");
  assertSafe("invalid token", tampered.body);
  console.log("✓ JWT altéré → ui.error + INVALID_TOKEN");

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
  const expired = await consume(adminCookie, expiredJwt);
  assertUi(expired.body, "warning", "EXPIRED_TOKEN");
  if (expired.body.reason !== "EXPIRED_TOKEN") throw new Error("expected EXPIRED_TOKEN");
  console.log("✓ JWT expiré → ui.warning + EXPIRED_TOKEN");

  if ((await consume("", jwt)).status !== 401) throw new Error("expected 401");
  console.log("✓ sans auth → 401");

  if ((await consume(convoyeurCookie, jwt)).status !== 403) throw new Error("expected 403");
  console.log("✓ convoyeur → 403");

  const first = await consume(adminCookie, jwt);
  if (first.status !== 200 || first.body.consumed !== true) {
    throw new Error(`consume failed: ${JSON.stringify(first.body)}`);
  }
  assertUi(first.body, "success", "consume success");
  if (!first.body.passenger?.id || !first.body.trip?.departureTime) {
    throw new Error("expected passenger + trip on success");
  }
  assertSafe("consume success", first.body);
  console.log("✓ consume valide → ui.success + métadonnées passager");

  const second = await consume(adminCookie, jwt);
  if (second.body.reason !== "BOARDING_ALREADY_USED") {
    throw new Error(`second scan: ${JSON.stringify(second.body)}`);
  }
  assertUi(second.body, "warning", "BOARDING_ALREADY_USED");
  if (!second.body.passenger?.id) {
    throw new Error("expected passenger on already used");
  }
  assertSafe("already used", second.body);
  console.log("✓ second scan → ui.warning + BOARDING_ALREADY_USED");

  const usedCount = psql(
    `SELECT COUNT(*) FROM "Reservation" WHERE id='${reservationId}' AND status='USED';`
  ).trim();
  if (usedCount !== "1") throw new Error("DB must stay USED once");

  const oldBt = psql(
    `SELECT "boardingToken" FROM "Reservation" WHERE id='${revokeCase.reservationId}';`
  ).trim();
  psql(
    `UPDATE "Reservation" SET "boardingToken"='revoked_${Date.now()}' WHERE id='${revokeCase.reservationId}';`
  );
  const revoked = await consume(adminCookie, revokeCase.jwt);
  assertUi(revoked.body, "error", "TOKEN_REVOKED");
  if (revoked.body.reason !== "TOKEN_REVOKED") throw new Error("expected TOKEN_REVOKED");
  psql(
    `UPDATE "Reservation" SET "boardingToken"='${oldBt}' WHERE id='${revokeCase.reservationId}';`
  );
  console.log("✓ token révoqué → ui.error + TOKEN_REVOKED");

  console.log("\nS2-T5 driver UI contract tests OK");
}

main().catch((e) => {
  console.error("S2-T5 FAILED:", e.message);
  process.exit(1);
});
