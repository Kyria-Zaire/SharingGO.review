import { env } from "../config/env.js";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMeta {
  requestId?: string;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = new Set([
  "databaseurl",
  "database_url",
  "password",
  "passwordhash",
  "token",
  "secret",
  "authorization",
  "stripe",
  "jwt",
  "signature",
  "stripesignature",
  "rawbody",
]);

function sanitizeStringValue(value: string): string {
  if (value.startsWith("postgresql://")) {
    return "[redacted]";
  }
  if (/^whsec_|^sk_|^pk_/.test(value)) {
    return "[redacted]";
  }
  if (/^(pi_|cs_)[a-zA-Z0-9]{12,}/.test(value)) {
    return `${value.slice(0, 7)}...${value.slice(-4)}`;
  }
  return value;
}

function sanitizeMeta(meta?: LogMeta): LogMeta | undefined {
  if (!meta) return undefined;

  const sanitized: LogMeta = {};
  for (const [key, value] of Object.entries(meta)) {
    const lower = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lower) || lower.includes("secret") || lower.includes("password")) {
      sanitized[key] = "[redacted]";
      continue;
    }
    if (typeof value === "string") {
      sanitized[key] = sanitizeStringValue(value);
      continue;
    }
    sanitized[key] = value;
  }
  return sanitized;
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...sanitizeMeta(meta),
  };
  const line = JSON.stringify(payload);

  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

export const logger = {
  info(message: string, meta?: LogMeta): void {
    write("info", message, meta);
  },
  warn(message: string, meta?: LogMeta): void {
    write("warn", message, meta);
  },
  error(message: string, meta?: LogMeta): void {
    write("error", message, meta);
  },
  debug(message: string, meta?: LogMeta): void {
    if (env.nodeEnv === "development") {
      write("debug", message, meta);
    }
  },
};
