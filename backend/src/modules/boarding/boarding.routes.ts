import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { adminLimiter } from "../../middleware/rate-limit.middleware.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { BOARDING_FIELD_SCAN_ROLES } from "./boarding.constants.js";
import {
  consumeBoardingTokenHandler,
  getBoardingQrContractHandler,
  getBoardingTokenHandler,
  validateBoardingTokenHandler,
} from "./boarding.controller.js";
import { getBoardingOfflineCapabilitiesHandler } from "./boarding-offline.controller.js";

export const boardingRouter = Router();

boardingRouter.get(
  "/offline-capabilities",
  asyncHandler(getBoardingOfflineCapabilitiesHandler)
);

boardingRouter.post(
  "/consume",
  adminLimiter,
  asyncHandler(requireAuth),
  requireRole(...BOARDING_FIELD_SCAN_ROLES),
  asyncHandler(consumeBoardingTokenHandler)
);

boardingRouter.post(
  "/validate",
  adminLimiter,
  asyncHandler(requireAuth),
  requireRole(...BOARDING_FIELD_SCAN_ROLES),
  asyncHandler(validateBoardingTokenHandler)
);

boardingRouter.get(
  "/:reservationId/qr",
  asyncHandler(requireAuth),
  asyncHandler(getBoardingQrContractHandler)
);

boardingRouter.get(
  "/:reservationId/token",
  asyncHandler(requireAuth),
  asyncHandler(getBoardingTokenHandler)
);
