import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  createCheckoutHandler,
  getPaymentHandler,
  listPaymentsHandler,
} from "./payments.controller.js";

export const paymentsRouter = Router();

paymentsRouter.get("/", asyncHandler(requireAuth), asyncHandler(listPaymentsHandler));
paymentsRouter.get("/:id", asyncHandler(requireAuth), asyncHandler(getPaymentHandler));

paymentsRouter.post("/checkout", asyncHandler(requireAuth), asyncHandler(createCheckoutHandler));
