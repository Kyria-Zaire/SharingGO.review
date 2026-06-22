/**
 * OPS-05B — Reporting backend tests.
 *
 * Usage (backend on :3000):
 *   node backend/scripts/ops05b-reporting-test.mjs
 */
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const password = "DemoPassword123!";

function isoDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function isoDaysAhead(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

async function login(email) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`login ${email}: ${res.status} ${JSON.stringify(body)}`);
  const cookie = res.headers.get("set-cookie");
  if (!cookie) throw new Error("missing cookie");
  return cookie.split(";")[0];
}

async function jsonFetch(path, { cookie } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: cookie ? { cookie } : {},
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, res };
}

async function csvFetch(path, { cookie } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: cookie ? { cookie } : {},
  });
  const buffer = Buffer.from(await res.arrayBuffer());
  const text = buffer.toString("utf8");
  return { status: res.status, text, buffer, res };
}

function hasUtf8Bom(buffer) {
  return buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const from = isoDaysAgo(30);
  const to = isoDaysAhead(30);
  const qs = new URLSearchParams({ from, to }).toString();

  console.log("OPS-05B reporting tests");
  console.log(`BASE_URL=${baseUrl}`);
  console.log(`period from=${from} to=${to}`);

  const adminCookie = await login("admin@sharinggo.demo");
  const passengerCookie = await login("convoyeur1@sharinggo.demo");

  // RBAC — passenger forbidden
  const forbidden = await jsonFetch(`/api/admin/reports/operations/overview?${qs}`, {
    cookie: passengerCookie,
  });
  assert(forbidden.status === 403, `expected 403 for passenger, got ${forbidden.status}`);
  console.log("✓ RBAC passenger → 403");

  // Overview
  const overview = await jsonFetch(`/api/admin/reports/operations/overview?${qs}`, {
    cookie: adminCookie,
  });
  assert(overview.status === 200, `overview failed: ${overview.status}`);
  assert(typeof overview.data.totalTrips === "number", "totalTrips missing");
  assert(typeof overview.data.boardingRate === "number", "boardingRate missing");
  assert(typeof overview.data.totalRevenue === "string", "totalRevenue missing");
  assert(overview.data.meta?.timezone === "Europe/Paris", "timezone meta missing");
  console.log("✓ GET /reports/operations/overview");

  // Trips report
  const trips = await jsonFetch(`/api/admin/reports/operations/trips?${qs}&limit=10`, {
    cookie: adminCookie,
  });
  assert(trips.status === 200, `trips report failed: ${trips.status}`);
  assert(Array.isArray(trips.data.trips), "trips array missing");
  assert(trips.data.pagination?.total >= 0, "pagination missing");
  console.log("✓ GET /reports/operations/trips");

  // Incidents report
  const incidents = await jsonFetch(`/api/admin/reports/operations/incidents?${qs}`, {
    cookie: adminCookie,
  });
  assert(incidents.status === 200, `incidents report failed: ${incidents.status}`);
  assert(incidents.data.aggregation?.total >= 0, "incidents aggregation missing");
  console.log("✓ GET /reports/operations/incidents");

  // Revenue report
  const revenue = await jsonFetch(`/api/admin/reports/operations/revenue?${qs}`, {
    cookie: adminCookie,
  });
  assert(revenue.status === 200, `revenue report failed: ${revenue.status}`);
  assert(Array.isArray(revenue.data.byDay), "byDay missing");
  assert(Array.isArray(revenue.data.byWeek), "byWeek missing");
  assert(Array.isArray(revenue.data.byMonth), "byMonth missing");
  console.log("✓ GET /reports/operations/revenue");

  // Period > 90 days rejected
  const tooLongFrom = isoDaysAgo(120);
  const tooLong = await jsonFetch(
    `/api/admin/reports/operations/overview?from=${encodeURIComponent(tooLongFrom)}&to=${encodeURIComponent(to)}`,
    { cookie: adminCookie }
  );
  assert(tooLong.status === 400, `expected 400 for >90d period, got ${tooLong.status}`);
  console.log("✓ period > 90 days → 400");

  // CSV exports with BOM
  for (const key of ["trips", "incidents", "payments", "summary"]) {
    const csv = await csvFetch(`/api/admin/reports/export/${key}.csv?${qs}`, {
      cookie: adminCookie,
    });
    assert(csv.status === 200, `${key} csv failed: ${csv.status}`);
    assert(hasUtf8Bom(csv.buffer), `${key} csv missing UTF-8 BOM bytes`);
    assert(
      csv.res.headers.get("content-type")?.includes("text/csv"),
      `${key} csv wrong content-type`
    );
    console.log(`✓ GET /reports/export/${key}.csv (BOM ok)`);
  }

  console.log("\nOPS-05B — all tests passed");
}

main().catch((error) => {
  console.error("\nOPS-05B — FAILED:", error.message);
  process.exit(1);
});
