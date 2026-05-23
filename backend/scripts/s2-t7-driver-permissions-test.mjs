/**
 * S2-T7 — DRIVER role boarding permissions tests.
 *
 * Usage (repo root):
 *   node backend/scripts/s2-t7-driver-permissions-test.mjs
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

async function postBoarding(path, cookie, body = { boardingToken: "not.a.jwt" }) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.status;
}

async function get(path, cookie) {
  const res = await fetch(`${baseUrl}${path}`, { headers: { cookie } });
  return res.status;
}

async function main() {
  for (const [k, v] of Object.entries(loadDotEnv())) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  const driverCookie = await login("driver@sharinggo.demo");
  const adminCookie = await login("admin@sharinggo.demo");
  const convoyeurCookie = await login("convoyeur1@sharinggo.demo");
  const passengerCookie = await login("passenger01@sharinggo.demo");
  const passenger02Cookie = await login("passenger02@sharinggo.demo");

  if ((await postBoarding("/api/boarding/validate", driverCookie)) !== 200) {
    throw new Error("DRIVER validate expected 200");
  }
  if ((await postBoarding("/api/boarding/consume", driverCookie)) !== 200) {
    throw new Error("DRIVER consume expected 200");
  }
  console.log("✓ DRIVER → validate/consume 200");

  if ((await get("/api/admin/reservations", driverCookie)) !== 403) {
    throw new Error("DRIVER admin reservations expected 403");
  }
  if ((await postBoarding("/api/admin/trips", driverCookie, { lineId: "x", driverId: "y" })) !== 403) {
    throw new Error("DRIVER POST admin/trips expected 403");
  }
  console.log("✓ DRIVER → /api/admin/* 403");

  if ((await postBoarding("/api/boarding/validate", convoyeurCookie)) !== 403) {
    throw new Error("CONVOYEUR validate expected 403");
  }
  if ((await postBoarding("/api/boarding/consume", convoyeurCookie)) !== 403) {
    throw new Error("CONVOYEUR consume expected 403");
  }
  console.log("✓ CONVOYEUR → validate/consume 403");

  if ((await postBoarding("/api/boarding/validate", adminCookie)) !== 200) {
    throw new Error("ADMIN validate expected 200");
  }
  if ((await postBoarding("/api/boarding/consume", adminCookie)) !== 200) {
    throw new Error("ADMIN consume expected 200");
  }
  console.log("✓ ADMIN → validate/consume 200");

  const list = await fetch(`${baseUrl}/api/reservations?status=CONFIRMED&limit=1`, {
    headers: { cookie: passengerCookie },
  });
  const reservationId = (await list.json()).reservations?.[0]?.id;
  if (!reservationId) throw new Error("no CONFIRMED reservation for owner test");

  const ownerToken = await fetch(`${baseUrl}/api/boarding/${reservationId}/token`, {
    headers: { cookie: passengerCookie },
  });
  if (ownerToken.status !== 200) throw new Error(`owner token: ${ownerToken.status}`);

  const driverToken = await fetch(`${baseUrl}/api/boarding/${reservationId}/token`, {
    headers: { cookie: driverCookie },
  });
  if (driverToken.status === 200) {
    throw new Error("DRIVER must not access passenger token endpoint");
  }

  const otherQr = await fetch(`${baseUrl}/api/boarding/${reservationId}/qr`, {
    headers: { cookie: passenger02Cookie },
  });
  if (otherQr.status === 200) {
    throw new Error("non-owner must not access qr");
  }

  const ownerQr = await fetch(`${baseUrl}/api/boarding/${reservationId}/qr`, {
    headers: { cookie: passengerCookie },
  });
  if (ownerQr.status !== 200) throw new Error(`owner qr: ${ownerQr.status}`);

  console.log("✓ token/qr owner-only (DRIVER + non-owner blocked)");

  const me = await fetch(`${baseUrl}/api/auth/me`, { headers: { cookie: driverCookie } });
  const meBody = await me.json();
  if (meBody.userType !== "DRIVER") throw new Error(`expected DRIVER got ${meBody.userType}`);
  console.log("✓ driver@sharinggo.demo userType=DRIVER");

  console.log("\nS2-T7 driver permissions tests OK");
}

main().catch((e) => {
  console.error("S2-T7 FAILED:", e.message);
  process.exit(1);
});
