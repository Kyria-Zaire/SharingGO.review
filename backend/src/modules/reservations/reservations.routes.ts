import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  cancelPendingHandler,
  createPendingHandler,
  getPendingHandler,
} from "./reservations.controller.js";

export const reservationsRouter = Router();

reservationsRouter.post(
  "/pending",
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
