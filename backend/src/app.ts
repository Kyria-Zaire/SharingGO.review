import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { asyncHandler } from "./lib/async-handler.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { stripeWebhookHandler } from "./modules/payments/payments.controller.js";
import { paymentsRouter } from "./modules/payments/payments.routes.js";
import { reservationsRouter } from "./modules/reservations/reservations.routes.js";
import { publicTripsRouter } from "./modules/trips/public-trips.routes.js";
import { transportAdminRouter } from "./modules/transport/transport.routes.js";
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

  // Stripe webhook must receive raw body for signature verification (before express.json).
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    asyncHandler(stripeWebhookHandler)
  );

  app.use(express.json());
  app.use(cookieParser());

  app.use(healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/admin", transportAdminRouter);
  app.use("/api/trips", publicTripsRouter);
  app.use("/api/reservations", reservationsRouter);
  app.use("/api/payments", paymentsRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
