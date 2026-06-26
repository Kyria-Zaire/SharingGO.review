/**
 * DEPLOY-READY P1-04 — Passenger regression QA (Playwright).
 * Usage: node scripts/p1-04-regression-qa.mjs
 * Requires: API on :3000, preview on :5174, playwright installed at repo root.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = dirname(fileURLToPath(import.meta.url));
const passengerRoot = join(__dirname, "..");
const repoRoot = join(passengerRoot, "..", "..", "..");
const outDir = join(repoRoot, "docs", "qa", "P1-04");
const reportPath = join(repoRoot, "docs", "audits", "DEPLOY-READY-P1-04-regression-qa.json");

const API = "http://localhost:3000";
const APP = "http://localhost:5174";

const DEMO_EMAIL = "passenger15@sharinggo.demo";
const DEMO_PASSWORD = "DemoPassword123!";

mkdirSync(outDir, { recursive: true });

async function apiHealth() {
  try {
    const res = await fetch(`${API}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

async function loginCookie() {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  const raw = res.headers.get("set-cookie") ?? "";
  const sessionPair = raw.split(";")[0];
  const eq = sessionPair.indexOf("=");
  if (eq === -1) throw new Error("no session cookie");
  return { name: sessionPair.slice(0, eq), value: sessionPair.slice(eq + 1) };
}

async function fetchTripId() {
  const res = await fetch(`${API}/api/trips?limit=5`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.trips?.[0]?.id ?? null;
}

async function fetchReservationId(cookieHeader) {
  const res = await fetch(`${API}/api/reservations?upcoming=true&limit=5`, {
    headers: { cookie: cookieHeader },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.reservations?.[0]?.id ?? null;
}

function cookieHeader(session) {
  return `${session.name}=${session.value}`;
}

const PAGES = [
  { id: "landing", path: "/", auth: false, wait: "main h1", slug: "01-landing" },
  { id: "trips", path: "/trips", auth: false, wait: "main h1", slug: "02-trips" },
  { id: "help", path: "/help", auth: false, wait: "main h1", slug: "03-help" },
  { id: "contact", path: "/contact", auth: false, wait: "main h1", slug: "04-contact" },
  { id: "legal-terms", path: "/legal/terms", auth: false, wait: "main h1", slug: "05-legal-terms" },
  { id: "legal-privacy", path: "/legal/privacy", auth: false, wait: "main h1", slug: "06-legal-privacy" },
  { id: "legal-notice", path: "/legal/notice", auth: false, wait: "main h1", slug: "07-legal-notice" },
  { id: "login", path: "/login", auth: false, wait: "main h1", slug: "08-login" },
  { id: "register", path: "/register", auth: false, wait: "main h1", slug: "09-register" },
  { id: "not-found", path: "/page-inexistante-qa", auth: false, wait: "main h1", slug: "10-not-found" },
  { id: "bookings", path: "/bookings", auth: true, wait: "main h1", slug: "11-bookings" },
  { id: "profile", path: "/profile", auth: true, wait: "main h1", slug: "12-profile" },
  { id: "profile-edit", path: "/profile/edit", auth: true, wait: "main h1", slug: "13-profile-edit" },
  { id: "settings", path: "/settings", auth: true, wait: "main h1", slug: "14-settings" },
  { id: "notifications", path: "/notifications", auth: true, wait: "main h1", slug: "15-notifications" },
  { id: "subscriptions", path: "/subscriptions", auth: true, wait: "main h1", slug: "16-subscriptions" },
  { id: "payment-success", path: "/bookings/payment/success", auth: true, wait: "main h1", slug: "17-payment-success" },
  { id: "payment-cancel", path: "/bookings/payment/cancel", auth: true, wait: "main h1", slug: "18-payment-cancel" },
];

async function visitPage(page, spec, dynamicPath) {
  const path = dynamicPath ?? spec.path;
  const url = `${APP}${path}`;
  const consoleErrors = [];
  const networkIssues = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));
  page.on("response", (res) => {
    const u = res.url();
    if (res.status() === 404 && !u.includes("favicon")) {
      networkIssues.push(`404 ${u}`);
    }
    if (res.status() >= 500) {
      networkIssues.push(`${res.status()} ${u}`);
    }
  });

  let status = "PASS";
  let note = "";

  try {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
    if (res && res.status() >= 400 && spec.id !== "not-found") {
      status = "FAIL";
      note = `HTTP ${res.status()}`;
    }
    await page.waitForSelector(spec.wait, { timeout: 15_000 });
    await page.waitForTimeout(800);
  } catch (err) {
    status = "FAIL";
    note = err instanceof Error ? err.message : String(err);
  }

  const reactErrors = consoleErrors.filter(
    (e) =>
      e.includes("React") ||
      e.includes("Minified React") ||
      e.includes("hydration") ||
      e.includes("Uncaught")
  );

  if (reactErrors.length > 0) status = "FAIL";
  if (networkIssues.some((n) => n.includes("500"))) status = "FAIL";

  return {
    id: spec.id,
    path,
    status,
    note,
    consoleErrors: [...new Set(consoleErrors)],
    networkIssues: [...new Set(networkIssues)],
    reactErrors,
  };
}

async function screenshot(page, name, fullPage = true) {
  await page.screenshot({ path: join(outDir, name), fullPage });
}

const apiOk = await apiHealth();
if (!apiOk) {
  console.error("API not reachable on :3000");
  process.exit(1);
}

let session = null;
let tripId = null;
let reservationId = null;

try {
  session = await loginCookie();
  tripId = await fetchTripId();
  reservationId = await fetchReservationId(cookieHeader(session));
} catch (err) {
  console.warn("Auth/data fetch warning:", err.message);
}

const browser = await chromium.launch({ headless: true });
const publicContext = await browser.newContext();
const authContext = await browser.newContext();

if (session) {
  await authContext.addCookies([
    {
      name: session.name,
      value: session.value,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

const results = [];

for (const viewport of [
  { label: "desktop", width: 1440, height: 900 },
  { label: "mobile", width: 390, height: 844 },
]) {
  for (const spec of PAGES) {
    const ctx = spec.auth ? authContext : publicContext;
    const page = await ctx.newPage();
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    const result = await visitPage(page, spec, null);
    results.push({ ...result, viewport: viewport.label });

    if (result.status === "PASS") {
      const shotName = `P1-04-${spec.slug}-${viewport.label}.png`;
      await screenshot(page, shotName, viewport.label === "desktop");
    }

    await page.close();
  }
}

// Dynamic routes
const dynamicSpecs = [];
if (tripId) {
  dynamicSpecs.push(
    { id: "trip-detail", path: `/trips/${tripId}`, auth: false, wait: "main h1", slug: "19-trip-detail" },
    { id: "booking-form", path: `/trips/${tripId}/book`, auth: true, wait: "main h1", slug: "20-booking-form" }
  );
}
if (reservationId) {
  dynamicSpecs.push(
    { id: "booking-detail", path: `/bookings/${reservationId}`, auth: true, wait: "main h1", slug: "21-booking-detail" },
    {
      id: "boarding-pass",
      path: `/bookings/${reservationId}/boarding-pass`,
      auth: true,
      wait: "main h1",
      slug: "22-boarding-pass",
    }
  );
}

for (const viewport of [
  { label: "desktop", width: 1440, height: 900 },
  { label: "mobile", width: 390, height: 844 },
]) {
  for (const spec of dynamicSpecs) {
    const ctx = spec.auth ? authContext : publicContext;
    const page = await ctx.newPage();
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const result = await visitPage(page, spec, spec.path);
    results.push({ ...result, viewport: viewport.label });
    if (result.status === "PASS") {
      await screenshot(page, `P1-04-${spec.slug}-${viewport.label}.png`, viewport.label === "desktop");
    }
    await page.close();
  }
}

await browser.close();

const summary = {
  runAt: new Date().toISOString(),
  apiOk,
  tripId,
  reservationId,
  total: results.length,
  pass: results.filter((r) => r.status === "PASS").length,
  fail: results.filter((r) => r.status === "FAIL").length,
  results,
};

writeFileSync(reportPath, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ summary: { pass: summary.pass, fail: summary.fail, outDir, reportPath } }, null, 2));

if (summary.fail > 0) process.exit(1);
