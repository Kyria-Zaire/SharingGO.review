/**
 * S1.5-T3 — Tests admin overview API (401/403/200 + JSON safe).
 */
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const FORBIDDEN = [
  "passwordHash",
  "hashedToken",
  "stripePaymentIntentId",
  "stripeCheckoutSessionId",
  "boardingToken",
];

function assertSafe(label, obj) {
  const json = JSON.stringify(obj);
  const leaks = FORBIDDEN.filter((k) => json.includes(k));
  if (leaks.length) throw new Error(`${label}: leaked ${leaks.join(", ")}`);
  if (json.match(/pi_[a-zA-Z0-9]{20,}/)) throw new Error(`${label}: full stripe PI id`);
  if (json.match(/cs_[a-zA-Z0-9]{20,}/)) throw new Error(`${label}: full stripe CS id`);
}

async function login(email, password) {
  await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName: "T", lastName: "U" }),
  });
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error(`login failed ${email}`);
  return cookie;
}

async function main() {
  const noAuth = await fetch(`${baseUrl}/api/admin/reservations`);
  if (noAuth.status !== 401) throw new Error(`expected 401 got ${noAuth.status}`);

  const suffix = Date.now();
  const convCookie = await login(`conv-${suffix}@example.com`, "TestPass123!");
  const forbidden = await fetch(`${baseUrl}/api/admin/reservations`, {
    headers: { Cookie: convCookie },
  });
  if (forbidden.status !== 403) throw new Error(`convoyeur expected 403 got ${forbidden.status}`);

  const adminEmail = `admin-${suffix}@example.com`;
  await login(adminEmail, "TestPass123!");

  const { execFileSync } = await import("node:child_process");
  execFileSync(
    "docker",
    [
      "exec",
      "sharinggo-postgres-dev",
      "psql",
      "-U",
      "postgres",
      "-d",
      "sharinggo",
      "-c",
      `UPDATE "User" SET "userType" = 'ADMIN' WHERE email = '${adminEmail}';`,
    ],
    { encoding: "utf8" }
  );

  const adminCookie = await login(adminEmail, "TestPass123!");

  const badLimit = await fetch(`${baseUrl}/api/admin/reservations?limit=101`, {
    headers: { Cookie: adminCookie },
  });
  if (badLimit.status !== 400) throw new Error(`limit 101 expected 400`);

  const badPending = await fetch(
    `${baseUrl}/api/admin/pending-reservations?active=true&expired=true`,
    { headers: { Cookie: adminCookie } }
  );
  if (badPending.status !== 400) throw new Error(`active+expired expected 400`);

  const resList = await fetch(`${baseUrl}/api/admin/reservations`, {
    headers: { Cookie: adminCookie },
  });
  const reservations = await resList.json();
  if (resList.status !== 200) throw new Error(`reservations ${resList.status}`);
  assertSafe("reservations", reservations);

  const payList = await fetch(`${baseUrl}/api/admin/payments`, {
    headers: { Cookie: adminCookie },
  });
  const payments = await payList.json();
  if (payList.status !== 200) throw new Error(`payments ${payList.status}`);
  assertSafe("payments", payments);

  const pendingList = await fetch(`${baseUrl}/api/admin/pending-reservations`, {
    headers: { Cookie: adminCookie },
  });
  const pending = await pendingList.json();
  if (pendingList.status !== 200) throw new Error(`pending ${pendingList.status}`);
  assertSafe("pending", pending);

  const trips = await (await fetch(`${baseUrl}/api/trips?limit=1`)).json();
  const tripId = trips.trips?.[0]?.id;
  if (tripId) {
    const occ = await fetch(`${baseUrl}/api/admin/trips/${tripId}/occupancy`, {
      headers: { Cookie: adminCookie },
    });
    const occJson = await occ.json();
    if (occ.status !== 200) throw new Error(`occupancy ${occ.status}`);
    assertSafe("occupancy", occJson);
    if (typeof occJson.confirmedSeats !== "number") throw new Error("missing confirmedSeats");
  }

  if (reservations.reservations?.[0]?.id) {
    const detail = await fetch(
      `${baseUrl}/api/admin/reservations/${reservations.reservations[0].id}`,
      { headers: { Cookie: adminCookie } }
    );
    assertSafe("reservation detail", await detail.json());
  }

  console.log("PASS S1.5-T3 admin overview API");
}

main().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
