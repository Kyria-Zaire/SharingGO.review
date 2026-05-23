/**
 * S2-T6 — Offline capabilities manifest tests.
 *
 * Usage (repo root):
 *   node backend/scripts/s2-t6-offline-capabilities-test.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

const FORBIDDEN = [
  "BOARDING_JWT_SECRET",
  "boardingJwtSecret",
  "stripeSecretKey",
  "boardingToken",
  '"bt"',
  "stripePaymentIntentId",
  "privateKey",
  "BEGIN RSA",
  "BEGIN PRIVATE",
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
    if (json.includes(key)) throw new Error(`${label}: forbidden ${key}`);
  }
  if (/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/.test(json)) {
    throw new Error(`${label}: JWT leaked in response`);
  }
  if (/"reservationId"|"passenger"|"firstName"/.test(json)) {
    throw new Error(`${label}: reservation-like data leaked`);
  }
}

async function getCapabilities() {
  const res = await fetch(`${baseUrl}/api/boarding/offline-capabilities`);
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
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

async function smokeValidate(adminCookie) {
  const res = await fetch(`${baseUrl}/api/boarding/validate`, {
    method: "POST",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ boardingToken: "not.a.jwt" }),
  });
  return res.status;
}

async function smokeConsume(adminCookie) {
  const res = await fetch(`${baseUrl}/api/boarding/consume`, {
    method: "POST",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ boardingToken: "not.a.jwt" }),
  });
  return res.status;
}

async function main() {
  for (const [k, v] of Object.entries(loadDotEnv())) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  const { status, body } = await getCapabilities();
  if (status !== 200) throw new Error(`offline-capabilities: ${status} ${JSON.stringify(body)}`);

  const off = body.offlineValidation;
  const srv = body.serverValidation;
  if (!off || !srv) throw new Error("missing offlineValidation or serverValidation");

  if (off.supported !== false) throw new Error("expected supported=false");
  if (off.reason !== "ASYMMETRIC_SIGNATURE_NOT_ENABLED") throw new Error(`reason: ${off.reason}`);
  if (off.currentAlgorithm !== "HS256") throw new Error(`algorithm: ${off.currentAlgorithm}`);
  if (off.canVerifySignatureOffline !== false) throw new Error("canVerifySignatureOffline must be false");
  if (off.canCheckRevocationOffline !== false) throw new Error("canCheckRevocationOffline must be false");
  if (off.canPreventDoubleScanOffline !== false) throw new Error("canPreventDoubleScanOffline must be false");
  if (off.canDecodePayloadOffline !== true) throw new Error("canDecodePayloadOffline must be true");
  if (!Array.isArray(off.targetAlgorithms) || !off.targetAlgorithms.includes("RS256")) {
    throw new Error("targetAlgorithms must include RS256");
  }

  if (srv.validateEndpoint !== "/api/boarding/validate") throw new Error("validateEndpoint mismatch");
  if (srv.consumeEndpoint !== "/api/boarding/consume") throw new Error("consumeEndpoint mismatch");
  if (srv.recommendedMode !== "ONLINE_FIRST") throw new Error("recommendedMode must be ONLINE_FIRST");

  assertSafe("capabilities", body);
  console.log("✓ GET offline-capabilities → 200, supported=false, HS256, no secrets");

  const openapiPath = join(repoRoot, "backend", "src", "docs", "openapi.json");
  const openapi = readFileSync(openapiPath, "utf8");
  if (!openapi.includes("/api/boarding/offline-capabilities")) {
    throw new Error("OpenAPI missing offline-capabilities path");
  }
  if (!openapi.includes("BoardingOfflineCapabilitiesResponse")) {
    throw new Error("OpenAPI missing BoardingOfflineCapabilitiesResponse schema");
  }
  console.log("✓ OpenAPI documents offline-capabilities");

  const adminCookie = await login("admin@sharinggo.demo", "DemoPassword123!");
  const validateStatus = await smokeValidate(adminCookie);
  const consumeStatus = await smokeConsume(adminCookie);
  if (validateStatus !== 200) throw new Error(`validate regression: ${validateStatus}`);
  if (consumeStatus !== 200) throw new Error(`consume regression: ${consumeStatus}`);
  console.log("✓ validate/consume still respond 200 on invalid JWT (unchanged)");

  console.log("\nS2-T6 offline capabilities tests OK");
}

main().catch((e) => {
  console.error("S2-T6 FAILED:", e.message);
  process.exit(1);
});
