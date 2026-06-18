/**
 * F3-T12 — Admin users API (team management).
 */
import { randomUUID } from "node:crypto";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const FORBIDDEN = ["passwordHash", "hashedToken", "boardingToken"];

function assertSafe(label, obj) {
  const json = JSON.stringify(obj);
  const leaks = FORBIDDEN.filter((k) => json.includes(k));
  if (leaks.length) throw new Error(`${label}: leaked ${leaks.join(", ")}`);
}

async function registerAndLogin(email, password) {
  await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName: "T", lastName: "U" }),
  });
  return loginOnly(email, password);
}

async function loginOnly(email, password) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  const body = await res.json().catch(() => ({}));
  if (!cookie) {
    throw new Error(`login failed ${email} status=${res.status} code=${body.error?.code}`);
  }
  return { cookie, user: body.user };
}

async function promoteAdmin(email) {
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
      `UPDATE "User" SET "userType" = 'ADMIN' WHERE email = '${email}';`,
    ],
    { encoding: "utf8" }
  );
}

async function jsonFetch(path, { method = "GET", cookie, body } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function main() {
  const runId = randomUUID();
  const adminEmail = `admin-f312-${runId}@example.com`;
  const password = "TestPass123!";

  await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password, firstName: "T", lastName: "U" }),
  });
  await promoteAdmin(adminEmail);
  const { cookie, user: adminUser } = await loginOnly(adminEmail, password);

  const list1 = await jsonFetch("/api/admin/users?limit=20&offset=0", { cookie });
  if (list1.res.status !== 200) throw new Error(`list users ${list1.res.status}`);
  assertSafe("list", list1.data);
  if (!Array.isArray(list1.data.items)) throw new Error("items missing");

  const driverEmail = `driver-f312-${runId}@example.com`;
  const createDriver = await jsonFetch("/api/admin/users", {
    method: "POST",
    cookie,
    body: {
      email: driverEmail,
      firstName: "Driver",
      lastName: "Test",
      userType: "DRIVER",
      password: "DriverPass1!",
    },
  });
  if (createDriver.res.status !== 201) {
    throw new Error(
      `create driver ${createDriver.res.status} code=${createDriver.data.error?.code ?? "n/a"}`
    );
  }
  assertSafe("create", createDriver.data);
  if (createDriver.data.createdByUserId !== adminUser.id) {
    throw new Error("expected createdByUserId to match admin creator");
  }
  const driverId = createDriver.data.id;

  const listActiveOnly = await jsonFetch("/api/admin/users?limit=100", { cookie });
  const driverInDefaultList = listActiveOnly.data.items?.some((u) => u.id === driverId);
  if (!driverInDefaultList) throw new Error("active driver missing from default list");

  const dup = await jsonFetch("/api/admin/users", {
    method: "POST",
    cookie,
    body: {
      email: driverEmail,
      userType: "DRIVER",
      password: "DriverPass2!",
    },
  });
  if (dup.res.status !== 409 || dup.data.error?.code !== "ADMIN_USER_EMAIL_ALREADY_EXISTS") {
    throw new Error(`duplicate email expected 409 got ${dup.res.status}`);
  }

  const roleChange = await jsonFetch(`/api/admin/users/${driverId}/role`, {
    method: "PATCH",
    cookie,
    body: { userType: "CONVOYEUR" },
  });
  if (roleChange.res.status !== 200) throw new Error(`role change ${roleChange.res.status}`);
  if (roleChange.data.userType !== "CONVOYEUR") throw new Error("role not updated");

  const { cookie: driverCookie } = await loginOnly(driverEmail, "DriverPass1!");
  const listWithLogin = await jsonFetch("/api/admin/users?limit=100", { cookie });
  const driverRow = listWithLogin.data.items?.find((u) => u.id === driverId);
  if (!driverRow?.lastLoginAt) throw new Error("expected lastLoginAt after driver login");

  const selfRole = await jsonFetch(`/api/admin/users/${adminUser.id}/role`, {
    method: "PATCH",
    cookie,
    body: { userType: "DRIVER" },
  });
  if (selfRole.res.status !== 409 || selfRole.data.error?.code !== "SELF_ROLE_CHANGE_FORBIDDEN") {
    throw new Error(`self role expected 409 got ${selfRole.res.status}`);
  }

  const selfDelete = await jsonFetch(`/api/admin/users/${adminUser.id}`, {
    method: "DELETE",
    cookie,
  });
  if (selfDelete.res.status !== 409 || selfDelete.data.error?.code !== "SELF_DELETE_FORBIDDEN") {
    throw new Error(`self delete expected 409 got ${selfDelete.res.status}`);
  }

  const admin2Email = `admin2-f312-${runId}@example.com`;
  const createAdmin2 = await jsonFetch("/api/admin/users", {
    method: "POST",
    cookie,
    body: {
      email: admin2Email,
      userType: "ADMIN",
      password: "Admin2Pass1!",
    },
  });
  if (createAdmin2.res.status !== 201) throw new Error(`create admin2 ${createAdmin2.res.status}`);
  const admin2Id = createAdmin2.data.id;

  const disableDriver = await jsonFetch(`/api/admin/users/${driverId}`, {
    method: "DELETE",
    cookie,
  });
  if (disableDriver.res.status !== 200) throw new Error(`disable driver ${disableDriver.res.status}`);
  if (disableDriver.data.status !== "DISABLED") throw new Error("expected DISABLED");

  const listAfterDisable = await jsonFetch("/api/admin/users?limit=100", { cookie });
  const driverInDefaultAfterDisable = listAfterDisable.data.items?.some((u) => u.id === driverId);
  if (driverInDefaultAfterDisable) {
    throw new Error("disabled user must be excluded from default list");
  }

  const listDisabled = await jsonFetch("/api/admin/users?status=DISABLED", { cookie });
  const found = listDisabled.data.items?.some((u) => u.id === driverId);
  if (!found) throw new Error("disabled user not in DISABLED filter");

  const disableAgain = await jsonFetch(`/api/admin/users/${driverId}`, {
    method: "DELETE",
    cookie,
  });
  if (disableAgain.res.status !== 200) throw new Error(`idempotent disable ${disableAgain.res.status}`);

  const disableAdmin1 = await jsonFetch(`/api/admin/users/${adminUser.id}`, {
    method: "DELETE",
    cookie,
  });
  if (disableAdmin1.res.status !== 200) throw new Error(`disable admin1 ${disableAdmin1.res.status}`);

  const { cookie: admin2Cookie } = await loginOnly(admin2Email, "Admin2Pass1!");

  const lastAdmin = await jsonFetch(`/api/admin/users/${admin2Id}`, {
    method: "DELETE",
    cookie: admin2Cookie,
  });
  if (lastAdmin.res.status !== 409 || lastAdmin.data.error?.code !== "LAST_ADMIN_PROTECTED") {
    throw new Error(`last admin delete expected 409 got ${lastAdmin.res.status}`);
  }

  console.log("F3-T12 admin-users-test: OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
