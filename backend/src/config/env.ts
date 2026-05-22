export type NodeEnv = "development" | "test" | "production";

export interface Env {
  nodeEnv: NodeEnv;
  port: number;
  databaseUrl: string;
  corsOrigin: string;
  sessionTtlDays: number;
  sessionCookieName: string;
  argon2MemoryCost: number;
  argon2TimeCost: number;
  argon2Parallelism: number;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
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

  return {
    nodeEnv: nodeEnvRaw,
    port,
    databaseUrl,
    corsOrigin,
    sessionTtlDays,
    sessionCookieName,
    argon2MemoryCost,
    argon2TimeCost,
    argon2Parallelism,
  };
}

/** Validated environment — throws at import if critical variables are missing or invalid. */
export const env: Env = parseEnv();
