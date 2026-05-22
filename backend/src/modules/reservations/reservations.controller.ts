import type { Request, Response } from "express";
import { AppError } from "../../lib/errors.js";
import { parseBody } from "../../lib/zod-parse.js";
import { createPendingReservationSchema } from "./reservations.schemas.js";
import * as reservationsService from "./reservations.service.js";

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  }
  return req.user.id;
}

export async function createPendingHandler(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const input = parseBody(createPendingReservationSchema, req.body);
  const result = await reservationsService.createPendingReservation(userId, input.tripId);
  res.status(201).json(result);
}

export async function getPendingHandler(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const pending = await reservationsService.getPendingReservation(
    userId,
    req.params.id ?? ""
  );
  res.status(200).json(pending);
}

export async function cancelPendingHandler(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  await reservationsService.cancelPendingReservation(userId, req.params.id ?? "");
  res.sendStatus(204);
}
