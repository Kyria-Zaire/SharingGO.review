import type { Request, Response } from "express";
import { AppError } from "../../lib/errors.js";
import { parseBody } from "../../lib/zod-parse.js";
import { createSubscriptionCheckout } from "./subscriptions-checkout.service.js";
import { subscriptionCheckoutBodySchema } from "./subscriptions.schemas.js";
import * as subscriptionsService from "./subscriptions.service.js";

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  }
  return req.user.id;
}

export async function getSubscriptionMeHandler(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const result = await subscriptionsService.getSubscriptionMe(userId);
  res.status(200).json(result);
}

export async function createSubscriptionCheckoutHandler(
  req: Request,
  res: Response
): Promise<void> {
  const userId = requireUserId(req);
  const { type } = parseBody(subscriptionCheckoutBodySchema, req.body);
  const result = await createSubscriptionCheckout(userId, type);
  res.status(200).json(result);
}
