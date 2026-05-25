import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { adminMiddleware } from "./admin.middleware.js";
import { listAdminActivityFeedHandler } from "./admin-activity-feed.controller.js";
import {
  createAdminIncidentHandler,
  deleteAdminIncidentHandler,
  getAdminIncidentHandler,
  importLocalIncidentsHandler,
  listAdminIncidentsHandler,
  patchAdminIncidentHandler,
} from "./admin-incidents.controller.js";
import { getAdminTripOccupancyHandler } from "./admin-occupancy.controller.js";
import { listAdminPaymentsHandler } from "./admin-payments.controller.js";
import { listAdminPendingHandler } from "./admin-pending.controller.js";
import {
  cancelAdminReservationHandler,
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

adminOperationsRouter.post(
  "/reservations/:id/cancel",
  ...adminMiddleware,
  asyncHandler(cancelAdminReservationHandler)
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

adminOperationsRouter.get(
  "/incidents",
  ...adminMiddleware,
  asyncHandler(listAdminIncidentsHandler)
);

adminOperationsRouter.post(
  "/incidents",
  ...adminMiddleware,
  asyncHandler(createAdminIncidentHandler)
);

adminOperationsRouter.post(
  "/incidents/import-local",
  ...adminMiddleware,
  asyncHandler(importLocalIncidentsHandler)
);

adminOperationsRouter.get(
  "/incidents/:id",
  ...adminMiddleware,
  asyncHandler(getAdminIncidentHandler)
);

adminOperationsRouter.patch(
  "/incidents/:id",
  ...adminMiddleware,
  asyncHandler(patchAdminIncidentHandler)
);

adminOperationsRouter.delete(
  "/incidents/:id",
  ...adminMiddleware,
  asyncHandler(deleteAdminIncidentHandler)
);

adminOperationsRouter.get(
  "/activity-feed",
  ...adminMiddleware,
  asyncHandler(listAdminActivityFeedHandler)
);
