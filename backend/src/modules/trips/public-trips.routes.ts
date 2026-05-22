import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { getPublicTripHandler, listPublicTripsHandler } from "./public-trips.controller.js";

export const publicTripsRouter = Router();

publicTripsRouter.get("/", asyncHandler(listPublicTripsHandler));
publicTripsRouter.get("/:id", asyncHandler(getPublicTripHandler));
