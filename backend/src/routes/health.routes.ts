import { Router } from "express";
import { getAppVersion } from "../lib/app-version.js";
import { env } from "../config/env.js";
import { getUptimeSeconds } from "../lib/process-metadata.js";
import { evaluateReadiness } from "../lib/readiness.js";

const SERVICE_NAME = "sharinggo-backend";

export const healthRouter = Router();

/** Liveness — process is running (no dependency checks). */
healthRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: SERVICE_NAME,
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    uptimeSeconds: getUptimeSeconds(),
    version: getAppVersion(),
  });
});

/** Readiness — ready to serve traffic (database + critical config). */
healthRouter.get("/ready", async (_req, res) => {
  const { ready, checks } = await evaluateReadiness();

  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    service: SERVICE_NAME,
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    checks,
  });
});
