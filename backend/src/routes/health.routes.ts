import { Router } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  let databaseStatus: "ok" | "error" = "ok";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    databaseStatus = "error";
  }

  const isHealthy = databaseStatus === "ok";
  const httpStatus = isHealthy ? 200 : 503;

  res.status(httpStatus).json({
    status: isHealthy ? "ok" : "error",
    service: "sharinggo-backend",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    database: {
      status: databaseStatus,
    },
  });
});
