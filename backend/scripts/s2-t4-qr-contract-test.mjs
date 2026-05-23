/**
 * S2-T4 — QR contract API tests.
 *
 * Usage (repo root):
 *   node backend/scripts/s2-t4-qr-contract-test.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

const FORBIDDEN = [
  "email",
  "stripePaymentIntentId",
  "boardingToken",
  '"bt"',
  "data:image",
  "base64",
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
    if (json.toLowerCase().includes(key.toLowerCase())) {
      throw new Error(`${label}: forbidden content ${key}`);
    }
  }
  if (!obj.qr?.payload?.includes(".") || obj.qr.payload.split(".").length !== 3) {
    throw new Error(`${label}: qr.payload must be a JWT`);
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

async function getQr(cookie, reservationId) {
  const res = await fetch(`${baseUrl}/api/boarding/${reservationId}/qr`, {
    headers: { cookie },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function validateAdmin(adminCookie, jwt) {
  const res = await fetch(`${baseUrl}/api/boarding/validate`, {
    method: "POST",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ boardingToken: jwt }),
  });
  return { status: res.status, body: await res.json() };
}

async function main() {
  const dotenv = loadDotEnv();
  for (const [k, v] of Object.entries(dotenv)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  const password = "DemoPassword123!";
  const adminCookie = await login("admin@sharinggo.demo", password);
  const ownerCookie = await login("passenger01@sharinggo.demo", password);
  const otherCookie = await login("passenger02@sharinggo.demo", password);

  const list = await fetch(`${baseUrl}/api/reservations?status=CONFIRMED&limit=1`, {
    headers: { cookie: ownerCookie },
  });
  const listData = await list.json();
  const reservationId = listData.reservations?.[0]?.id;
  if (!reservationId) throw new Error("no CONFIRMED reservation");

  const qrRes = await getQr(ownerCookie, reservationId);
  if (qrRes.status !== 200) throw new Error(`owner QR: ${qrRes.status} ${JSON.stringify(qrRes.body)}`);

  const { body } = qrRes;
  if (body.qr?.format !== "jwt") throw new Error("expected qr.format=jwt");
  if (body.qr?.recommendedEncoding !== "QR_TEXT") {
    throw new Error("expected qr.recommendedEncoding=QR_TEXT");
  }
  assertSafe("qr contract", body);
  console.log("✓ owner GET QR contract → 200");

  const validation = await validateAdmin(adminCookie, body.qr.payload);
  if (validation.status !== 200 || validation.body.valid !== true) {
    throw new Error(`validate qr.payload failed: ${JSON.stringify(validation.body)}`);
  }
  console.log("✓ qr.payload validé par POST /api/boarding/validate");

  const other = await getQr(otherCookie, reservationId);
  if (other.status !== 404 || other.body.error?.code !== "RESERVATION_NOT_FOUND") {
    throw new Error(`other user expected 404: ${other.status}`);
  }
  console.log("✓ autre user → 404 RESERVATION_NOT_FOUND");

  const tokenRes = await fetch(`${baseUrl}/api/boarding/${reservationId}/token`, {
    headers: { cookie: ownerCookie },
  });
  const tokenBody = await tokenRes.json();
  if (tokenRes.status !== 200) throw new Error("token endpoint broken");
  if (tokenBody.boardingToken !== body.qr.payload) {
    throw new Error("qr.payload must match /token boardingToken for same reservation");
  }
  console.log("✓ qr.payload cohérent avec GET /token");

  console.log("\nS2-T4 QR contract tests OK");
}

main().catch((e) => {
  console.error("S2-T4 FAILED:", e.message);
  process.exit(1);
});
