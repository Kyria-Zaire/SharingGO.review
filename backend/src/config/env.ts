export type NodeEnv = "development" | "test" | "production";

export interface Env {
  nodeEnv: NodeEnv;
  port: number;
  enableApiDocs: boolean;
  databaseUrl: string;
  corsOrigin: string;
  sessionTtlDays: number;
  sessionCookieName: string;
  argon2MemoryCost: number;
  argon2TimeCost: number;
  argon2Parallelism: number;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripeSuccessUrl: string;
  stripeCancelUrl: string;
  stripeTicketPriceCents: number;
  stripeCurrency: string;
  stripePriceMosolfMonthly: string;
  stripePriceConvoyeurMonthly: string;
  stripeSubscriptionSuccessUrl: string;
  stripeSubscriptionCancelUrl: string;
  boardingJwtSecret: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function parseEnableApiDocs(nodeEnv: NodeEnv): boolean {
  const raw = process.env.ENABLE_API_DOCS;
  if (raw !== undefined && raw.trim() !== "") {
    return raw.trim().toLowerCase() === "true";
  }
  return nodeEnv === "development";
}

function parsePositiveInt(name: string, raw: string): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Invalid ${name}: "${raw}". Expected a positive integer.`);
  }
  return value;
}

function parseEnv(): Env {
  const nodeEnvRaw = requireEnv("NODE_ENV");
  if (
    nodeEnvRaw !== "development" &&
    nodeEnvRaw !== "test" &&
    nodeEnvRaw !== "production"
  ) {
    throw new Error(
      `Invalid NODE_ENV: "${nodeEnvRaw}". Expected development, test, or production.`
    );
  }

  const portRaw = requireEnv("PORT");
  const port = Number(portRaw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: "${portRaw}". Expected an integer between 1 and 65535.`);
  }

  const databaseUrl = requireEnv("DATABASE_URL");
  const corsOrigin = requireEnv("CORS_ORIGIN");
  const sessionTtlDays = parsePositiveInt("SESSION_TTL_DAYS", requireEnv("SESSION_TTL_DAYS"));
  const sessionCookieName = requireEnv("SESSION_COOKIE_NAME");

  const argon2MemoryCost = parsePositiveInt(
    "ARGON2_MEMORY_COST",
    requireEnv("ARGON2_MEMORY_COST")
  );
  const argon2TimeCost = parsePositiveInt("ARGON2_TIME_COST", requireEnv("ARGON2_TIME_COST"));
  const argon2Parallelism = parsePositiveInt(
    "ARGON2_PARALLELISM",
    requireEnv("ARGON2_PARALLELISM")
  );

  const stripeSecretKey = requireEnv("STRIPE_SECRET_KEY");
  if (!stripeSecretKey.startsWith("sk_")) {
    throw new Error(
      'Invalid STRIPE_SECRET_KEY: use the Stripe secret key (sk_test_... or sk_live_...), not the publishable key (pk_test_...). See Developers → API keys in the Stripe Dashboard.'
    );
  }
  const stripeWebhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET");
  if (!stripeWebhookSecret.startsWith("whsec_") || stripeWebhookSecret.length < 20) {
    throw new Error(
      'Invalid STRIPE_WEBHOOK_SECRET: run "stripe listen --forward-to localhost:3000/api/webhooks/stripe" and copy the whsec_... value into .env, then restart the backend.'
    );
  }
  const stripeSuccessUrl = requireEnv("STRIPE_SUCCESS_URL");
  const stripeCancelUrl = requireEnv("STRIPE_CANCEL_URL");
  const stripeTicketPriceCents = parsePositiveInt(
    "STRIPE_TICKET_PRICE_CENTS",
    requireEnv("STRIPE_TICKET_PRICE_CENTS")
  );
  const stripeCurrency = requireEnv("STRIPE_CURRENCY").toLowerCase();
  if (stripeCurrency !== "eur") {
    throw new Error(`Invalid STRIPE_CURRENCY: "${stripeCurrency}". Only "eur" is supported in V1.`);
  }

  const stripePriceMosolfMonthly = requireEnv("STRIPE_PRICE_MOSOLF_MONTHLY");
  const stripePriceConvoyeurMonthly = requireEnv("STRIPE_PRICE_CONVOYEUR_MONTHLY");
  if (!stripePriceMosolfMonthly.startsWith("price_")) {
    throw new Error(
      `Invalid STRIPE_PRICE_MOSOLF_MONTHLY: expected a Stripe Price id (price_...).`
    );
  }
  if (!stripePriceConvoyeurMonthly.startsWith("price_")) {
    throw new Error(
      `Invalid STRIPE_PRICE_CONVOYEUR_MONTHLY: expected a Stripe Price id (price_...).`
    );
  }
  const stripeSubscriptionSuccessUrl = requireEnv("STRIPE_SUBSCRIPTION_SUCCESS_URL");
  const stripeSubscriptionCancelUrl = requireEnv("STRIPE_SUBSCRIPTION_CANCEL_URL");

  const boardingJwtSecret = requireEnv("BOARDING_JWT_SECRET");
  if (boardingJwtSecret.length < 32) {
    throw new Error(
      `Invalid BOARDING_JWT_SECRET: must be at least 32 characters. Generate a random secret for HS256 signing.`
    );
  }

  return {
    nodeEnv: nodeEnvRaw,
    port,
    enableApiDocs: parseEnableApiDocs(nodeEnvRaw),
    databaseUrl,
    corsOrigin,
    sessionTtlDays,
    sessionCookieName,
    argon2MemoryCost,
    argon2TimeCost,
    argon2Parallelism,
    stripeSecretKey,
    stripeWebhookSecret,
    stripeSuccessUrl,
    stripeCancelUrl,
    stripeTicketPriceCents,
    stripeCurrency,
    stripePriceMosolfMonthly,
    stripePriceConvoyeurMonthly,
    stripeSubscriptionSuccessUrl,
    stripeSubscriptionCancelUrl,
    boardingJwtSecret,
  };
}

/** Validated environment — throws at import if critical variables are missing or invalid. */
export const env: Env = parseEnv();
