import type { Request, Response } from "express";
import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import { logger } from "../lib/logger.js";

export const RATE_LIMIT_CODES = {
  auth: "RATE_LIMITED_AUTH",
  publicRead: "RATE_LIMITED_PUBLIC_READ",
  reservation: "RATE_LIMITED_RESERVATION",
  checkout: "RATE_LIMITED_CHECKOUT",
  admin: "RATE_LIMITED_ADMIN",
} as const;

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

function parseOptionalPositiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    return fallback;
  }
  return value;
}

interface NamedLimiterConfig {
  limiterName: string;
  code: string;
  windowMs: number;
  max: number;
  maxEnvKey?: string;
  windowEnvKey?: string;
}

function createNamedLimiter(config: NamedLimiterConfig): RateLimitRequestHandler {
  const windowMs = config.windowEnvKey
    ? parseOptionalPositiveInt(config.windowEnvKey, config.windowMs)
    : config.windowMs;
  const max = config.maxEnvKey
    ? parseOptionalPositiveInt(config.maxEnvKey, config.max)
    : config.max;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler(req: Request, res: Response): void {
      const requestId = req.requestId ?? "unknown";
      logger.warn("Rate limit exceeded", {
        requestId,
        route: req.originalUrl || req.path,
        ip: req.ip || undefined,
        limiter: config.limiterName,
      });
      res.status(429).json({
        error: {
          message: "Too many requests",
          code: config.code,
          requestId,
        },
      });
    },
  });
}

/** POST /api/auth/login, POST /api/auth/register — brute-force protection. */
export const authLimiter = createNamedLimiter({
  limiterName: "authLimiter",
  code: RATE_LIMIT_CODES.auth,
  windowMs: FIFTEEN_MINUTES_MS,
  max: 10,
  maxEnvKey: "RATE_LIMIT_AUTH_MAX",
  windowEnvKey: "RATE_LIMIT_AUTH_WINDOW_MS",
});

/** GET /api/trips — light scraping protection. */
export const publicReadLimiter = createNamedLimiter({
  limiterName: "publicReadLimiter",
  code: RATE_LIMIT_CODES.publicRead,
  windowMs: ONE_MINUTE_MS,
  max: 120,
  maxEnvKey: "RATE_LIMIT_PUBLIC_READ_MAX",
  windowEnvKey: "RATE_LIMIT_PUBLIC_READ_WINDOW_MS",
});

/** POST /api/reservations/pending — pending spam protection. */
export const reservationLimiter = createNamedLimiter({
  limiterName: "reservationLimiter",
  code: RATE_LIMIT_CODES.reservation,
  windowMs: ONE_MINUTE_MS,
  max: 10,
  maxEnvKey: "RATE_LIMIT_RESERVATION_MAX",
  windowEnvKey: "RATE_LIMIT_RESERVATION_WINDOW_MS",
});

/** POST /api/payments/checkout — checkout spam protection. */
export const checkoutLimiter = createNamedLimiter({
  limiterName: "checkoutLimiter",
  code: RATE_LIMIT_CODES.checkout,
  windowMs: ONE_MINUTE_MS,
  max: 5,
  maxEnvKey: "RATE_LIMIT_CHECKOUT_MAX",
  windowEnvKey: "RATE_LIMIT_CHECKOUT_WINDOW_MS",
});

/** /api/admin/* — admin operations abuse protection. */
export const adminLimiter = createNamedLimiter({
  limiterName: "adminLimiter",
  code: RATE_LIMIT_CODES.admin,
  windowMs: ONE_MINUTE_MS,
  max: 60,
  maxEnvKey: "RATE_LIMIT_ADMIN_MAX",
  windowEnvKey: "RATE_LIMIT_ADMIN_WINDOW_MS",
});
