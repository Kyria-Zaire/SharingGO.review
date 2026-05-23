import { UserType } from "@prisma/client";
import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { adminLimiter } from "../../middleware/rate-limit.middleware.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
  consumeBoardingTokenHandler,
  getBoardingQrContractHandler,
  getBoardingTokenHandler,
  validateBoardingTokenHandler,
} from "./boarding.controller.js";

export const boardingRouter = Router();

boardingRouter.post(
  "/consume",
  adminLimiter,
  asyncHandler(requireAuth),
  requireRole(UserType.ADMIN, UserType.SUPER_ADMIN),
  asyncHandler(consumeBoardingTokenHandler)
);

boardingRouter.post(
  "/validate",
  adminLimiter,
  asyncHandler(requireAuth),
  requireRole(UserType.ADMIN, UserType.SUPER_ADMIN),
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
