import { UserType } from "@prisma/client";
import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
  createLineHandler,
  getLineHandler,
  listLinesHandler,
  updateLineHandler,
} from "./lines.controller.js";
import {
  createTripHandler,
  disableTripHandler,
  enableTripHandler,
  getTripHandler,
  listTripsHandler,
  updateTripHandler,
} from "./trips.controller.js";
import {
  cancelTripHandler,
  markCompletedHandler,
  markDepartedHandler,
  startBoardingHandler,
} from "../trips/trip-lifecycle.controller.js";

const adminMiddleware = [
  asyncHandler(requireAuth),
  requireRole(UserType.ADMIN, UserType.SUPER_ADMIN),
] as const;

export const linesRouter = Router();
linesRouter.post("/", ...adminMiddleware, asyncHandler(createLineHandler));
linesRouter.get("/", ...adminMiddleware, asyncHandler(listLinesHandler));
linesRouter.get("/:id", ...adminMiddleware, asyncHandler(getLineHandler));
linesRouter.patch("/:id", ...adminMiddleware, asyncHandler(updateLineHandler));

export const tripsRouter = Router();
tripsRouter.post("/", ...adminMiddleware, asyncHandler(createTripHandler));
tripsRouter.get("/", ...adminMiddleware, asyncHandler(listTripsHandler));
tripsRouter.get("/:id", ...adminMiddleware, asyncHandler(getTripHandler));
tripsRouter.patch("/:id", ...adminMiddleware, asyncHandler(updateTripHandler));
tripsRouter.post("/:id/start-boarding", ...adminMiddleware, asyncHandler(startBoardingHandler));
tripsRouter.post("/:id/depart", ...adminMiddleware, asyncHandler(markDepartedHandler));
tripsRouter.post("/:id/complete", ...adminMiddleware, asyncHandler(markCompletedHandler));
tripsRouter.post("/:id/cancel", ...adminMiddleware, asyncHandler(cancelTripHandler));
tripsRouter.post("/:id/disable", ...adminMiddleware, asyncHandler(disableTripHandler));
tripsRouter.post("/:id/enable", ...adminMiddleware, asyncHandler(enableTripHandler));

export const transportAdminRouter = Router();
transportAdminRouter.use("/lines", linesRouter);
transportAdminRouter.use("/trips", tripsRouter);
