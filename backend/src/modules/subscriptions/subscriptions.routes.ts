import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { getSubscriptionMeHandler } from "./subscriptions.controller.js";

export const subscriptionsRouter = Router();

subscriptionsRouter.get("/me", asyncHandler(requireAuth), asyncHandler(getSubscriptionMeHandler));
