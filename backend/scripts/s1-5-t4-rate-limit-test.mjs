/**
 * S1.5-T4 — Rate limit smoke tests.
 * Run with low limits, e.g. RATE_LIMIT_*_MAX=2 and restart backend.
 */
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

const EXPECTED_CODES = {
  auth: "RATE_LIMITED_AUTH",
  publicRead: "RATE_LIMITED_PUBLIC_READ",
  reservation: "RATE_LIMITED_RESERVATION",
  checkout: "RATE_LIMITED_CHECKOUT",
  admin: "RATE_LIMITED_ADMIN",
};

function assert429(label, res, body, expectedCode) {
  if (res.status !== 429) {
    throw new Error(`${label}: expected 429 got ${res.status} ${JSON.stringify(body)}`);
  }
  if (!body?.error?.requestId) {
    throw new Error(`${label}: missing requestId`);
  }
  if (body.error.code !== expectedCode) {
    throw new Error(`${label}: expected code ${expectedCode} got ${body.error.code}`);
  }
  if (body.error.message !== "Too many requests") {
    throw new Error(`${label}: unexpected message`);
  }
}

async function exhaustPost(path, body, count, label, code) {
  let last;
  for (let i = 0; i < count; i++) {
    last = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (last.status === 429) {
      const blocked = await last.json();
      assert429(label, last, blocked, code);
      return;
    }
  }
  const fallback = await last.json().catch(() => ({}));
  throw new Error(`${label}: no 429 after ${count} requests (last ${last.status})`);
}

async function exhaustGet(path, count, label, code, headers = {}) {
  let last;
  for (let i = 0; i < count; i++) {
    last = await fetch(`${baseUrl}${path}`, { headers });
    if (last.status === 429) {
      const blocked = await last.json();
      assert429(label, last, blocked, code);
      return;
    }
  }
  throw new Error(`${label}: no 429 after ${count} requests (last ${last?.status})`);
}

async function login(email, password) {
  await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName: "R", lastName: "L" }),
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
  const burst = Number(process.env.RATE_LIMIT_TEST_BURST ?? "12");

  const suffix = Date.now();
  const cookie = await login(`rl-${suffix}@example.com`, "TestPass123!");
  await exhaustPost(
    "/api/reservations/pending",
    { tripId: "00000000-0000-0000-0000-000000000000" },
    burst,
    "reservation pending",
    EXPECTED_CODES.reservation
  );
  console.log("OK reservation pending rate limit");

  async function exhaustPostWithCookie(path, body, count, label, code, cookieHeader) {
    let last;
    for (let i = 0; i < count; i++) {
      last = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(body),
      });
      if (last.status === 429) {
        const blocked = await last.json();
        assert429(label, last, blocked, code);
        return;
      }
    }
    throw new Error(`${label}: no 429 after ${count} (last ${last?.status})`);
  }

  await exhaustPostWithCookie(
    "/api/payments/checkout",
    { pendingReservationId: "00000000-0000-0000-0000-000000000000" },
    burst,
    "checkout",
    EXPECTED_CODES.checkout,
    cookie
  );
  console.log("OK checkout rate limit");

  const adminEmail = `admin-rl-${suffix}@example.com`;
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
  await exhaustGet(
    "/api/admin/reservations",
    61,
    "admin reservations",
    EXPECTED_CODES.admin,
    { Cookie: adminCookie }
  );
  console.log("OK admin rate limit");

  const webhookBurst = 20;
  for (let i = 0; i < webhookBurst; i++) {
    const res = await fetch(`${baseUrl}/api/webhooks/stripe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (res.status === 429) {
      const body = await res.json();
      throw new Error(`webhook must not be rate limited: ${JSON.stringify(body)}`);
    }
  }
  console.log("OK stripe webhook not rate limited (no 429)");

  await exhaustPost(
    "/api/auth/login",
    { email: "rate@example.com", password: "x" },
    burst,
    "auth login",
    EXPECTED_CODES.auth
  );
  console.log("OK auth login rate limit");

  await exhaustPost(
    "/api/auth/register",
    {
      email: `reg-${Date.now()}@example.com`,
      password: "TestPass123!",
      firstName: "A",
      lastName: "B",
    },
    burst,
    "auth register",
    EXPECTED_CODES.auth
  );
  console.log("OK auth register rate limit");

  await exhaustGet("/api/trips", 121, "public trips", EXPECTED_CODES.publicRead);
  console.log("OK public trips rate limit");

  console.log("S1.5-T4 rate limit tests passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
