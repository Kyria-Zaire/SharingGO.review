import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { getBoardingTokenHandler } from "./boarding.controller.js";

export const boardingRouter = Router();

boardingRouter.get(
  "/:reservationId/token",
  asyncHandler(requireAuth),
  asyncHandler(getBoardingTokenHandler)
);
