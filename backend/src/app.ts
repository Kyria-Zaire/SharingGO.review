import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { asyncHandler } from "./lib/async-handler.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { adminLimiter, publicReadLimiter } from "./middleware/rate-limit.middleware.js";
import { adminOperationsRouter } from "./modules/admin/admin.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { boardingRouter } from "./modules/boarding/boarding.routes.js";
import { stripeWebhookHandler } from "./modules/payments/payments.controller.js";
import { paymentsRouter } from "./modules/payments/payments.routes.js";
import { reservationsRouter } from "./modules/reservations/reservations.routes.js";
import { subscriptionsRouter } from "./modules/subscriptions/subscriptions.routes.js";
import { publicTripsRouter } from "./modules/trips/public-trips.routes.js";
import { transportAdminRouter } from "./modules/transport/transport.routes.js";
import { docsRouter } from "./routes/docs.routes.js";
import { healthRouter } from "./routes/health.routes.js";

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
  if (env.enableApiDocs) {
    app.use("/api", docsRouter);
  }
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminLimiter);
  app.use("/api/admin", transportAdminRouter);
  app.use("/api/admin", adminOperationsRouter);
  app.use("/api/trips", publicReadLimiter, publicTripsRouter);
  app.use("/api/reservations", reservationsRouter);
  app.use("/api/boarding", boardingRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/subscriptions", subscriptionsRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
