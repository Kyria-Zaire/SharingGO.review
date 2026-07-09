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
  promoteHeuristicIncidentHandler,
} from "./admin-incidents.controller.js";
import { getExploitationHistoryHandler } from "./admin-exploitation-history.controller.js";
import { getAdminTripOccupancyHandler } from "./admin-occupancy.controller.js";
import {
  exportReportCsvHandler,
  getOperationsIncidentsReportHandler,
  getOperationsOverviewHandler,
  getOperationsRevenueReportHandler,
  getOperationsTripsReportHandler,
} from "./admin-reports.controller.js";
import { listAdminPaymentsHandler } from "./admin-payments.controller.js";
import { listAdminPendingHandler } from "./admin-pending.controller.js";
import {
  cancelAdminReservationHandler,
  getAdminReservationHandler,
  listAdminReservationsHandler,
  refundAdminReservationHandler,
} from "./admin-reservations.controller.js";
import {
  createAdminUserHandler,
  disableAdminUserHandler,
  listAdminUsersHandler,
  patchAdminUserRoleHandler,
} from "./admin-users.controller.js";

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

adminOperationsRouter.post(
  "/reservations/:id/refund",
  ...adminMiddleware,
  asyncHandler(refundAdminReservationHandler)
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
  "/trips/:id/exploitation-history",
  ...adminMiddleware,
  asyncHandler(getExploitationHistoryHandler)
);

adminOperationsRouter.get(
  "/reports/operations/overview",
  ...adminMiddleware,
  asyncHandler(getOperationsOverviewHandler)
);

adminOperationsRouter.get(
  "/reports/operations/trips",
  ...adminMiddleware,
  asyncHandler(getOperationsTripsReportHandler)
);

adminOperationsRouter.get(
  "/reports/operations/incidents",
  ...adminMiddleware,
  asyncHandler(getOperationsIncidentsReportHandler)
);

adminOperationsRouter.get(
  "/reports/operations/revenue",
  ...adminMiddleware,
  asyncHandler(getOperationsRevenueReportHandler)
);

adminOperationsRouter.get(
  "/reports/export/:reportKey",
  ...adminMiddleware,
  asyncHandler(exportReportCsvHandler)
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

adminOperationsRouter.post(
  "/incidents/promote-heuristic",
  ...adminMiddleware,
  asyncHandler(promoteHeuristicIncidentHandler)
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

adminOperationsRouter.get(
  "/users",
  ...adminMiddleware,
  asyncHandler(listAdminUsersHandler)
);

adminOperationsRouter.post(
  "/users",
  ...adminMiddleware,
  asyncHandler(createAdminUserHandler)
);

adminOperationsRouter.patch(
  "/users/:id/role",
  ...adminMiddleware,
  asyncHandler(patchAdminUserRoleHandler)
);

adminOperationsRouter.delete(
  "/users/:id",
  ...adminMiddleware,
  asyncHandler(disableAdminUserHandler)
);
