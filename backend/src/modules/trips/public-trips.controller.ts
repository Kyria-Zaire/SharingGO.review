import type { Request, Response } from "express";
import { parseQuery } from "../../lib/zod-parse.js";
import { listPublicTripsQuerySchema } from "./public-trips.schemas.js";
import * as publicTripsService from "./public-trips.service.js";

export async function listPublicTripsHandler(req: Request, res: Response): Promise<void> {
  const query = parseQuery(listPublicTripsQuerySchema, req.query);
  const result = await publicTripsService.listPublicTrips(query);
  res.status(200).json(result);
}

export async function getPublicTripHandler(req: Request, res: Response): Promise<void> {
  const trip = await publicTripsService.getPublicTripById(req.params.id ?? "");
  res.status(200).json(trip);
}
