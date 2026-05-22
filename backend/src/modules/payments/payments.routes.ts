import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { createCheckoutHandler } from "./payments.controller.js";

export const paymentsRouter = Router();

paymentsRouter.post("/checkout", asyncHandler(requireAuth), asyncHandler(createCheckoutHandler));
