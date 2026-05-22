/**
 * S2-T1 — Boarding JWT foundation tests.
 *
 * Usage (repo root):
 *   node backend/scripts/s2-t1-boarding-token-test.mjs
 *
 * Prérequis : backend up, seed demo, BOARDING_JWT_SECRET dans .env, migration appliquée.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

const FORBIDDEN_RESPONSE_KEYS = ["email", "firstName", "lastName", "password", "stripePaymentIntentId"];

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

function decodeJwtPayload(jwt) {
  const parts = jwt.split(".");
  if (parts.length !== 3) throw new Error("invalid jwt structure");
  return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
}

function assertJsonSafe(label, obj) {
  const json = JSON.stringify(obj);
  for (const key of FORBIDDEN_RESPONSE_KEYS) {
    if (json.includes(`"${key}"`)) {
      throw new Error(`${label}: forbidden field leaked: ${key}`);
    }
  }
}

async function login(email, password) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`login ${email} failed: ${res.status} ${JSON.stringify(body)}`);
  const cookie = res.headers.get("set-cookie");
  if (!cookie) throw new Error("missing session cookie");
  return cookie.split(";")[0];
}

async function apiGet(path, cookie) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { cookie },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  const dotenv = loadDotEnv();
  for (const [key, value] of Object.entries(dotenv)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  const secret = process.env.BOARDING_JWT_SECRET ?? dotenv.BOARDING_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("BOARDING_JWT_SECRET missing or too short in .env");
  }

  const jwtModuleUrl = pathToFileURL(
    join(__dirname, "..", "dist", "modules", "boarding", "boarding-jwt.js")
  ).href;
  const { verifyBoardingToken, signBoardingJwt, BoardingTokenVerificationError } = await import(
    jwtModuleUrl
  );

  const password = "DemoPassword123!";
  const ownerCookie = await login("passenger01@sharinggo.demo", password);
  const otherCookie = await login("passenger02@sharinggo.demo", password);

  const list = await apiGet("/api/reservations?status=CONFIRMED&limit=5", ownerCookie);
  if (list.status !== 200 || !list.body.reservations?.length) {
    throw new Error(`no CONFIRMED reservations: ${JSON.stringify(list.body)}`);
  }

  const reservation = list.body.reservations[0];
  const reservationId = reservation.id;
  const departureMs = new Date(reservation.trip.departureTime).getTime();
  const expectedExpMs = departureMs + 10 * 60 * 1000;

  const tokenRes = await apiGet(`/api/boarding/${reservationId}/token`, ownerCookie);
  if (tokenRes.status !== 200) {
    throw new Error(`owner GET token failed: ${tokenRes.status} ${JSON.stringify(tokenRes.body)}`);
  }

  const { boardingToken, expiresAt, tripId } = tokenRes.body;
  if (!boardingToken || boardingToken.split(".").length !== 3) {
    throw new Error("response boardingToken must be a JWT");
  }
  if (tokenRes.body.reservationId !== reservationId) {
    throw new Error("reservationId mismatch");
  }
  if (tripId !== reservation.trip.id) {
    throw new Error("tripId mismatch");
  }
  assertJsonSafe("boarding response", tokenRes.body);

  const payload = decodeJwtPayload(boardingToken);
  if (payload.typ !== "boarding") throw new Error(`expected typ boarding got ${payload.typ}`);
  if (payload.sub !== reservationId) throw new Error("jwt sub mismatch");
  if (!payload.bt || payload.bt.includes(".")) throw new Error("bt must be opaque, not JWT");
  if (payload.exp * 1000 !== expectedExpMs) {
    throw new Error(`exp mismatch: got ${payload.exp * 1000} expected ${expectedExpMs}`);
  }
  if (new Date(expiresAt).getTime() !== expectedExpMs) {
    throw new Error(`expiresAt mismatch: ${expiresAt}`);
  }

  const verified = verifyBoardingToken(boardingToken);
  if (verified.reservationId !== reservationId) throw new Error("verify sub mismatch");
  if (verified.opaqueBoardingToken !== payload.bt) throw new Error("verify bt mismatch");

  const tokenRes2 = await apiGet(`/api/boarding/${reservationId}/token`, ownerCookie);
  const payload2 = decodeJwtPayload(tokenRes2.body.boardingToken);
  if (payload2.bt !== payload.bt) {
    throw new Error("opaque boardingToken in DB should be stable across calls");
  }

  const tampered = `${boardingToken.slice(0, -1)}x`;
  try {
    verifyBoardingToken(tampered);
    throw new Error("tampered JWT should fail verify");
  } catch (err) {
    if (!(err instanceof BoardingTokenVerificationError) || err.reason !== "invalid_signature") {
      throw err;
    }
  }

  const expiredJwt = signBoardingJwt({
    sub: reservationId,
    typ: "boarding",
    uid: payload.uid,
    tid: tripId,
    bt: payload.bt,
    iat: Math.floor(Date.now() / 1000) - 7200,
    exp: Math.floor(Date.now() / 1000) - 3600,
  });
  try {
    verifyBoardingToken(expiredJwt);
    throw new Error("expired JWT should fail verify");
  } catch (err) {
    if (!(err instanceof BoardingTokenVerificationError) || err.reason !== "expired") {
      throw err;
    }
  }

  const otherUser = await apiGet(`/api/boarding/${reservationId}/token`, otherCookie);
  if (otherUser.status !== 404 || otherUser.body.error?.code !== "RESERVATION_NOT_FOUND") {
    throw new Error(`other user expected 404 RESERVATION_NOT_FOUND got ${otherUser.status}`);
  }

  const fakeId = "cmfake0000000000000000000";
  const fakeRes = await apiGet(`/api/boarding/${fakeId}/token`, ownerCookie);
  if (fakeRes.status !== 404) {
    throw new Error(`unknown reservation expected 404 got ${fakeRes.status}`);
  }

  console.log("S2-T1 boarding token tests OK");
  console.log("- owner GET token → 200");
  console.log("- JWT payload typ/sub/bt/exp correct");
  console.log("- exp = departure + 10 min");
  console.log("- opaque DB token stable (same bt on re-fetch)");
  console.log("- verifyBoardingToken valid OK");
  console.log("- verifyBoardingToken invalid signature OK");
  console.log("- verifyBoardingToken expired OK");
  console.log("- other user → 404 RESERVATION_NOT_FOUND");
}

main().catch((err) => {
  console.error("S2-T1 boarding token tests FAILED:", err.message);
  process.exit(1);
});
