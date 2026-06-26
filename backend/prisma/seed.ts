/**
 * S1.5-T6 — Demo dataset (dev/QA only).
 * Requires ALLOW_DEMO_SEED=true and NODE_ENV !== production.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import argon2 from "argon2";
import {
  PaymentStatus,
  PaymentType,
  Prisma,
  PrismaClient,
  ReservationStatus,
  SubscriptionStatus,
  SubscriptionType,
  UserType,
} from "@prisma/client";

const DEMO_EMAIL_DOMAIN = "@sharinggo.demo";
/** Display name (ASCII arrow for Windows/libpq WIN1252 compatibility; shown as ↔ in product docs). */
const DEMO_LINE_NAME = "Ch\u00e2lons-en-Champagne <-> A\u00e9roport Paris-Vatry";
const DEMO_LINE_START = "Châlons-en-Champagne";
const DEMO_LINE_END = "Aéroport Paris-Vatry";
const DEMO_PASSWORD = "DemoPassword123!";
const DEMO_DAYS = 6;
const TRIPS_PER_DAY = 8;
const DEPARTURE_SLOTS = ["05:30", "07:00", "09:00", "11:30", "14:00", "16:30", "18:30", "21:00"];
const ARRIVAL_MINUTES = 40;

/** Occupancy targets (confirmed seats) for the first trips — includes one full 8/8. */
const OCCUPANCY_TARGETS = [0, 2, 5, 7, 8, 0, 0, 1, 3, 4, 2, 6];

const prisma = new PrismaClient();

function loadEnvFiles(): void {
  const candidates = [join(process.cwd(), ".env"), join(process.cwd(), "../.env")];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    const lines = readFileSync(path, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
    break;
  }
}

function assertSeedAllowed(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo seed is forbidden when NODE_ENV=production");
  }
  if (process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error(
      'Demo seed requires ALLOW_DEMO_SEED=true (see docs/features/S1-5-T6-realistic-transport-seed-demo-dataset.md)'
    );
  }
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is required to run demo seed");
  }
}

function parisWallTimeToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  let utc = Date.UTC(year, month - 1, day, hour, minute);
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  for (let i = 0; i < 4; i++) {
    const parts = Object.fromEntries(
      dtf.formatToParts(new Date(utc)).map((p) => [p.type, p.value])
    );
    const shownUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute)
    );
    const targetUtc = Date.UTC(year, month - 1, day, hour, minute);
    utc += targetUtc - shownUtc;
  }
  return new Date(utc);
}

function startOfTodayParis(): { year: number; month: number; day: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

function addDaysYmd(ymd: { year: number; month: number; day: number }, days: number): {
  year: number;
  month: number;
  day: number;
} {
  const d = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

async function hashDemoPassword(): Promise<string> {
  const memoryCost = Number(process.env.ARGON2_MEMORY_COST ?? "65536");
  const timeCost = Number(process.env.ARGON2_TIME_COST ?? "3");
  const parallelism = Number(process.env.ARGON2_PARALLELISM ?? "1");
  return argon2.hash(DEMO_PASSWORD, {
    type: argon2.argon2id,
    memoryCost,
    timeCost,
    parallelism,
  });
}

function demoStripeIds(suffix: string): { pi: string; cs: string } {
  return {
    pi: `demo_pi_${suffix}`,
    cs: `demo_cs_${suffix}`,
  };
}

async function cleanupDemoData(): Promise<void> {
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_EMAIL_DOMAIN } },
    select: { id: true },
  });
  const demoUserIds = demoUsers.map((u) => u.id);

  const demoLine = await prisma.line.findFirst({
    where: { startCity: DEMO_LINE_START, endCity: DEMO_LINE_END },
    select: { id: true },
  });

  if (demoLine) {
    const trips = await prisma.trip.findMany({
      where: { lineId: demoLine.id },
      select: { id: true },
    });
    const tripIds = trips.map((t) => t.id);

    if (tripIds.length > 0) {
      await prisma.payment.deleteMany({
        where: {
          OR: [{ reservation: { tripId: { in: tripIds } } }, { userId: { in: demoUserIds } }],
        },
      });
      await prisma.pendingReservation.deleteMany({
        where: {
          OR: [{ tripId: { in: tripIds } }, { userId: { in: demoUserIds } }],
        },
      });
      await prisma.reservation.deleteMany({ where: { tripId: { in: tripIds } } });
      await prisma.trip.deleteMany({ where: { lineId: demoLine.id } });
    }

    await prisma.line.delete({ where: { id: demoLine.id } });
  }

  if (demoUserIds.length > 0) {
    await prisma.subscription.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.session.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: demoUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } });
  }
}

async function upsertDemoUser(
  email: string,
  userType: UserType,
  passwordHash: string,
  firstName: string,
  lastName: string
): Promise<string> {
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      userType,
      firstName,
      lastName,
    },
  });
  return user.id;
}

async function createDemoSubscription(
  userId: string,
  type: SubscriptionType,
  status: SubscriptionStatus,
  currentPeriodEnd: Date,
  currentPeriodStart: Date
): Promise<void> {
  await prisma.subscription.create({
    data: {
      userId,
      type,
      status,
      currentPeriodStart,
      currentPeriodEnd,
    },
  });
}

async function main(): Promise<void> {
  loadEnvFiles();
  assertSeedAllowed();

  console.log("[demo-seed] Cleaning previous @sharinggo.demo data…");
  await cleanupDemoData();

  const passwordHash = await hashDemoPassword();
  const now = new Date();

  const adminId = await upsertDemoUser(
    "admin@sharinggo.demo",
    UserType.ADMIN,
    passwordHash,
    "Admin",
    "Demo"
  );

  await upsertDemoUser(
    "driver@sharinggo.demo",
    UserType.DRIVER,
    passwordHash,
    "Chauffeur",
    "Demo"
  );

  const convoyeurIds: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const id = await upsertDemoUser(
      `convoyeur${i}@sharinggo.demo`,
      UserType.CONVOYEUR,
      passwordHash,
      `Convoyeur`,
      `${i}`
    );
    convoyeurIds.push(id);
  }

  const mosolfActiveId = await upsertDemoUser(
    "mosolf-active@sharinggo.demo",
    UserType.CONVOYEUR,
    passwordHash,
    "Mosolf",
    "Actif"
  );
  const mosolfExpiredId = await upsertDemoUser(
    "mosolf-expired@sharinggo.demo",
    UserType.CONVOYEUR,
    passwordHash,
    "Mosolf",
    "Expire"
  );
  const convoyeurMonthlyId = await upsertDemoUser(
    "convoyeur-monthly@sharinggo.demo",
    UserType.CONVOYEUR,
    passwordHash,
    "Convoyeur",
    "Mensuel"
  );

  const periodStart = now;
  const activePeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiredPeriodEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  await createDemoSubscription(
    mosolfActiveId,
    SubscriptionType.MOSOLF_MONTHLY,
    SubscriptionStatus.ACTIVE,
    activePeriodEnd,
    periodStart
  );
  await createDemoSubscription(
    mosolfExpiredId,
    SubscriptionType.MOSOLF_MONTHLY,
    SubscriptionStatus.EXPIRED,
    expiredPeriodEnd,
    new Date(expiredPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000)
  );
  await createDemoSubscription(
    convoyeurMonthlyId,
    SubscriptionType.CONVOYEUR_MONTHLY,
    SubscriptionStatus.ACTIVE,
    activePeriodEnd,
    periodStart
  );

  const passengerIds: string[] = [];
  for (let i = 1; i <= 24; i++) {
    const id = await upsertDemoUser(
      `passenger${String(i).padStart(2, "0")}@sharinggo.demo`,
      UserType.CONVOYEUR,
      passwordHash,
      "Passager",
      String(i)
    );
    passengerIds.push(id);
  }

  const line = await prisma.line.create({
    data: {
      name: DEMO_LINE_NAME,
      startCity: DEMO_LINE_START,
      endCity: DEMO_LINE_END,
    },
  });

  const today = startOfTodayParis();
  const tripRecords: { id: string; departureTime: Date }[] = [];
  let tripIndex = 0;

  for (let day = 0; day < DEMO_DAYS; day++) {
    const ymd = addDaysYmd(today, day);
    for (let slot = 0; slot < TRIPS_PER_DAY; slot++) {
      const [hour, minute] = DEPARTURE_SLOTS[slot]!.split(":").map(Number) as [number, number];
      const departureTime = parisWallTimeToUtc(ymd.year, ymd.month, ymd.day, hour, minute);
      if (departureTime <= now) {
        continue;
      }
      const arrivalTime = new Date(departureTime.getTime() + ARRIVAL_MINUTES * 60 * 1000);
      const driverId = convoyeurIds[tripIndex % convoyeurIds.length]!;

      const trip = await prisma.trip.create({
        data: {
          lineId: line.id,
          driverId,
          departureTime,
          arrivalTime,
          totalSeats: 8,
        },
      });
      tripRecords.push({ id: trip.id, departureTime });
      tripIndex++;
    }
  }

  if (tripRecords.length < 5) {
    throw new Error(
      `Not enough future trips created (${tripRecords.length}). Run seed earlier in the day or adjust slots.`
    );
  }

  let passengerCursor = 0;
  const nextPassenger = (): string => {
    const id = passengerIds[passengerCursor % passengerIds.length]!;
    passengerCursor++;
    return id;
  };

  for (let i = 0; i < tripRecords.length; i++) {
    const trip = tripRecords[i]!;
    const target =
      i < OCCUPANCY_TARGETS.length ? OCCUPANCY_TARGETS[i]! : Math.min(3, i % 6);

    for (let seat = 0; seat < target; seat++) {
      const userId = nextPassenger();
      const suffix = `${trip.id.slice(-8)}_${seat}`;

      const reservation = await prisma.reservation.create({
        data: {
          tripId: trip.id,
          userId,
          status: ReservationStatus.CONFIRMED,
        },
      });

      const stripe = demoStripeIds(suffix);
      await prisma.payment.create({
        data: {
          userId,
          reservationId: reservation.id,
          amount: new Prisma.Decimal("8.99"),
          currency: "eur",
          status: PaymentStatus.SUCCEEDED,
          type: PaymentType.TICKET,
          stripePaymentIntentId: stripe.pi,
          stripeCheckoutSessionId: stripe.cs,
        },
      });
    }
  }

  const tripPendingActive = tripRecords[5] ?? tripRecords[0]!;
  await prisma.pendingReservation.create({
    data: {
      tripId: tripPendingActive.id,
      userId: passengerIds[20]!,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
    },
  });

  const tripPendingExpired = tripRecords[6] ?? tripRecords[1]!;
  await prisma.pendingReservation.create({
    data: {
      tripId: tripPendingExpired.id,
      userId: passengerIds[21]!,
      expiresAt: new Date(now.getTime() - 10 * 60 * 1000),
    },
  });

  const tripConsumed = tripRecords[4]!;
  const consumedUserId = passengerIds[22]!;
  const consumedReservation = await prisma.reservation.findFirst({
    where: { tripId: tripConsumed.id, status: ReservationStatus.CONFIRMED },
    select: { id: true, userId: true },
  });
  if (consumedReservation) {
    await prisma.pendingReservation.create({
      data: {
        tripId: tripConsumed.id,
        userId: consumedReservation.userId,
        expiresAt: new Date(now.getTime() - 30 * 60 * 1000),
        consumedAt: new Date(now.getTime() - 25 * 60 * 1000),
      },
    });
  } else {
    await prisma.pendingReservation.create({
      data: {
        tripId: tripConsumed.id,
        userId: consumedUserId,
        expiresAt: new Date(now.getTime() - 30 * 60 * 1000),
        consumedAt: new Date(now.getTime() - 25 * 60 * 1000),
      },
    });
  }

  await prisma.payment.create({
    data: {
      userId: passengerIds[23]!,
      amount: new Prisma.Decimal("8.99"),
      currency: "eur",
      status: PaymentStatus.FAILED,
      type: PaymentType.TICKET,
      stripePaymentIntentId: demoStripeIds("failed_standalone").pi,
    },
  });

  await prisma.payment.create({
    data: {
      userId: passengerIds[0]!,
      amount: new Prisma.Decimal("8.99"),
      currency: "eur",
      status: PaymentStatus.PENDING,
      type: PaymentType.TICKET,
      stripeCheckoutSessionId: demoStripeIds("pending_abandoned").cs,
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: adminId,
        action: "DEMO_SEED_RUN",
        targetType: "System",
        targetId: line.id,
        metadata: { lineName: DEMO_LINE_NAME, trips: tripRecords.length },
      },
      {
        actorUserId: adminId,
        action: "DEMO_RESERVATION_CREATED",
        targetType: "Line",
        targetId: line.id,
      },
      {
        actorUserId: adminId,
        action: "DEMO_PAYMENT_SUCCEEDED",
        targetType: "Line",
        targetId: line.id,
      },
    ],
  });

  console.log("[demo-seed] Done.");
  console.log(`  Line: ${DEMO_LINE_NAME}`);
  console.log(`  Trips (future): ${tripRecords.length}`);
  console.log(
    `  Users: admin + driver + 4 convoyeurs + ${passengerIds.length} passagers demo`
  );
  console.log(`  Password (all demo accounts): ${DEMO_PASSWORD}`);
  console.log(
    "  Accounts: admin@sharinggo.demo, driver@sharinggo.demo, convoyeur1..4@sharinggo.demo"
  );
  console.log(
    "  Subscriptions: mosolf-active@, mosolf-expired@, convoyeur-monthly@sharinggo.demo"
  );
}

main()
  .catch((err) => {
    console.error("[demo-seed] Failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
