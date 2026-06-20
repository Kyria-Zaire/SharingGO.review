import type { Request, Response } from "express";
import { parseBody } from "../../lib/zod-parse.js";
import { cancelTripSchema } from "./trip-lifecycle.schemas.js";
import * as tripLifecycleService from "./trip-lifecycle.service.js";

function actorId(req: Request): string {
  if (!req.user) {
    throw new Error("requireAuth must run before trip lifecycle handlers");
  }
  return req.user.id;
}

export async function startBoardingHandler(req: Request, res: Response): Promise<void> {
  const trip = await tripLifecycleService.startBoarding(req.params.id ?? "", actorId(req));
  res.status(200).json({ trip });
}

export async function markDepartedHandler(req: Request, res: Response): Promise<void> {
  const trip = await tripLifecycleService.markDeparted(req.params.id ?? "", actorId(req));
  res.status(200).json({ trip });
}

export async function markCompletedHandler(req: Request, res: Response): Promise<void> {
  const trip = await tripLifecycleService.markCompleted(req.params.id ?? "", actorId(req));
  res.status(200).json({ trip });
}

export async function cancelTripHandler(req: Request, res: Response): Promise<void> {
  const input = parseBody(cancelTripSchema, req.body);
  const trip = await tripLifecycleService.cancelTrip(req.params.id ?? "", input, actorId(req));
  res.status(200).json({ trip });
}
