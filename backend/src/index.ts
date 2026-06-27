import type { Server } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { connectPrisma, disconnectPrisma } from "./lib/prisma.js";
// Sentry doit s'initialiser avant tout autre import applicatif pour instrumenter
// automatiquement les modules Node (http, express, prisma). L'import de sentry.ts
// est placé ici — le plus tôt possible dans le bootstrap — avant createApp() et
// connectPrisma(), de façon à capturer aussi les erreurs de démarrage.
import { initSentry } from "./lib/sentry.js";

initSentry();

let server: Server | null = null;
let isShuttingDown = false;

async function main(): Promise<void> {
  await connectPrisma();
  logger.info("PostgreSQL connected via Prisma");

  const app = createApp();

  server = app.listen(env.port, "0.0.0.0", () => {
    logger.info("Backend listening", {
      port: env.port,
      nodeEnv: env.nodeEnv,
    });
    logger.info("Health endpoints ready", { paths: ["/health", "/ready"] });
  });
}

function shutdown(signal: string): void {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info("Shutdown signal received", { signal });

  const forceExitTimer = setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  const closeServer = new Promise<void>((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  void (async () => {
    try {
      await closeServer;
      logger.info("HTTP server closed");
      await disconnectPrisma();
      logger.info("Prisma disconnected");
      clearTimeout(forceExitTimer);
      process.exit(0);
    } catch (error: unknown) {
      logger.error("Shutdown failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    }
  })();
}

main().catch((error: unknown) => {
  logger.error("Failed to start backend", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});
