import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { healthRouter } from "./routes/health.routes.js";

/**
 * Rate limiter prepared for future tickets (10/min public, 100/min auth).
 * Not mounted in S0-T3 per ticket scope.
 */
export const publicRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(requestIdMiddleware);
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());

  app.use(healthRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
