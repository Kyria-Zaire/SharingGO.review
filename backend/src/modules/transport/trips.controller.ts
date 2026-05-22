import type { Request, Response } from "express";
import { parseBody, parseQuery } from "../../lib/zod-parse.js";
import { createTripSchema, listTripsQuerySchema, updateTripSchema } from "./trips.schemas.js";
import * as tripsService from "./trips.service.js";

function actorId(req: Request): string {
  if (!req.user) {
    throw new Error("requireAuth must run before trips handlers");
  }
  return req.user.id;
}

export async function createTripHandler(req: Request, res: Response): Promise<void> {
  const input = parseBody(createTripSchema, req.body);
  const trip = await tripsService.createTrip(input, actorId(req));
  res.status(201).json({ trip });
}

export async function listTripsHandler(req: Request, res: Response): Promise<void> {
  const query = parseQuery(listTripsQuerySchema, req.query);
  const trips = await tripsService.listTrips(query);
  res.status(200).json({ trips });
}

export async function getTripHandler(req: Request, res: Response): Promise<void> {
  const trip = await tripsService.getTripById(req.params.id ?? "");
  res.status(200).json({ trip });
}

export async function updateTripHandler(req: Request, res: Response): Promise<void> {
  const input = parseBody(updateTripSchema, req.body);
  const trip = await tripsService.updateTrip(req.params.id ?? "", input, actorId(req));
  res.status(200).json({ trip });
}

export async function disableTripHandler(req: Request, res: Response): Promise<void> {
  const trip = await tripsService.disableTrip(req.params.id ?? "", actorId(req));
  res.status(200).json({ trip });
}

export async function enableTripHandler(req: Request, res: Response): Promise<void> {
  const trip = await tripsService.enableTrip(req.params.id ?? "", actorId(req));
  res.status(200).json({ trip });
}
