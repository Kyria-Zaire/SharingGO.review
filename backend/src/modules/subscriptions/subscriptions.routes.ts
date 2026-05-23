import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { checkoutLimiter } from "../../middleware/rate-limit.middleware.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  createSubscriptionCheckoutHandler,
  getSubscriptionMeHandler,
} from "./subscriptions.controller.js";

export const subscriptionsRouter = Router();

subscriptionsRouter.get("/me", asyncHandler(requireAuth), asyncHandler(getSubscriptionMeHandler));

subscriptionsRouter.post(
  "/checkout",
  checkoutLimiter,
  asyncHandler(requireAuth),
  asyncHandler(createSubscriptionCheckoutHandler)
);
