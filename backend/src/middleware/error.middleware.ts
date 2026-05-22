import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

interface ErrorBody {
  message: string;
  code: string;
  requestId: string;
}

function sendError(res: Response, status: number, body: ErrorBody): void {
  res.status(status).json({ error: body });
}

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId ?? "unknown";

  if (err instanceof AppError) {
    sendError(res, err.statusCode, {
      message: err.message,
      code: err.code,
      requestId,
    });
    return;
  }

  logger.error("Unhandled server error", {
    requestId,
    error: err instanceof Error ? err.message : String(err),
  });

  const isProduction = env.nodeEnv === "production";
  sendError(res, 500, {
    message: isProduction
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    requestId,
  });
}
