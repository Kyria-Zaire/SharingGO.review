import { env } from "../config/env.js";
import { prisma } from "./prisma.js";

export type DependencyCheckStatus = "ok" | "error";

export interface ReadinessChecks {
  database: { status: DependencyCheckStatus };
  configuration: { status: DependencyCheckStatus };
  stripe: { status: DependencyCheckStatus };
}

export interface ReadinessResult {
  ready: boolean;
  checks: ReadinessChecks;
}

async function checkDatabase(): Promise<DependencyCheckStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch {
    return "error";
  }
}

/** Env is validated at import; this confirms critical config is present without exposing values. */
function checkConfiguration(): DependencyCheckStatus {
  const hasCore =
    env.databaseUrl.length > 0 &&
    env.corsOrigin.length > 0 &&
    env.sessionCookieName.length > 0 &&
    Number.isInteger(env.port) &&
    env.port >= 1;

  return hasCore ? "ok" : "error";
}

/**
 * Stripe is required in V1 (no disable flag). Local presence/format only — no network call.
 */
function checkStripeConfiguration(): DependencyCheckStatus {
  const hasStripe =
    env.stripeSecretKey.startsWith("sk_") &&
    env.stripeWebhookSecret.startsWith("whsec_") &&
    env.stripeWebhookSecret.length >= 20 &&
    env.stripeTicketPriceCents >= 1 &&
    env.stripeCurrency === "eur" &&
    env.stripeSuccessUrl.length > 0 &&
    env.stripeCancelUrl.length > 0;

  return hasStripe ? "ok" : "error";
}

export async function evaluateReadiness(): Promise<ReadinessResult> {
  const [database, configuration, stripe] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkConfiguration()),
    Promise.resolve(checkStripeConfiguration()),
  ]);

  const checks: ReadinessChecks = { database: { status: database }, configuration: { status: configuration }, stripe: { status: stripe } };
  const ready = database === "ok" && configuration === "ok" && stripe === "ok";

  return { ready, checks };
}
