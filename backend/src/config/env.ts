export type NodeEnv = "development" | "test" | "production";

export interface Env {
  nodeEnv: NodeEnv;
  port: number;
  databaseUrl: string;
  corsOrigin: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
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

  return {
    nodeEnv: nodeEnvRaw,
    port,
    databaseUrl,
    corsOrigin,
  };
}

/** Validated environment — throws at import if critical variables are missing or invalid. */
export const env: Env = parseEnv();
