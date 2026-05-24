import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { reservationLimiter } from "../../middleware/rate-limit.middleware.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  bookWithSubscriptionHandler,
  cancelPendingHandler,
  createPendingHandler,
  getPendingHandler,
  getReservationHandler,
  listReservationsHandler,
} from "./reservations.controller.js";

export const reservationsRouter = Router();

reservationsRouter.post(
  "/book-with-subscription",
  reservationLimiter,
  asyncHandler(requireAuth),
  asyncHandler(bookWithSubscriptionHandler)
);

reservationsRouter.post(
  "/pending",
  reservationLimiter,
  asyncHandler(requireAuth),
  asyncHandler(createPendingHandler)
);

reservationsRouter.get(
  "/pending/:id",
  asyncHandler(requireAuth),
  asyncHandler(getPendingHandler)
);

reservationsRouter.delete(
  "/pending/:id",
  asyncHandler(requireAuth),
  asyncHandler(cancelPendingHandler)
);

reservationsRouter.get(
  "/",
  asyncHandler(requireAuth),
  asyncHandler(listReservationsHandler)
);

reservationsRouter.get(
  "/:id",
  asyncHandler(requireAuth),
  asyncHandler(getReservationHandler)
);
