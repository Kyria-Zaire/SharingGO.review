import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { adminMiddleware } from "./admin.middleware.js";
import { getAdminTripOccupancyHandler } from "./admin-occupancy.controller.js";
import { listAdminPaymentsHandler } from "./admin-payments.controller.js";
import { listAdminPendingHandler } from "./admin-pending.controller.js";
import {
  getAdminReservationHandler,
  listAdminReservationsHandler,
} from "./admin-reservations.controller.js";

export const adminOperationsRouter = Router();

adminOperationsRouter.get(
  "/reservations",
  ...adminMiddleware,
  asyncHandler(listAdminReservationsHandler)
);

adminOperationsRouter.get(
  "/reservations/:id",
  ...adminMiddleware,
  asyncHandler(getAdminReservationHandler)
);

adminOperationsRouter.get(
  "/payments",
  ...adminMiddleware,
  asyncHandler(listAdminPaymentsHandler)
);

adminOperationsRouter.get(
  "/pending-reservations",
  ...adminMiddleware,
  asyncHandler(listAdminPendingHandler)
);

adminOperationsRouter.get(
  "/trips/:id/occupancy",
  ...adminMiddleware,
  asyncHandler(getAdminTripOccupancyHandler)
);
