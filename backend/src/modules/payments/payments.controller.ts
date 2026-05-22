import type { Request, Response } from "express";
import { AppError } from "../../lib/errors.js";
import { parseBody, parseQuery } from "../../lib/zod-parse.js";
import * as paymentsReadService from "./payments-read.service.js";
import {
  createCheckoutSchema,
  listPaymentsQuerySchema,
  paymentIdParamSchema,
} from "./payments.schemas.js";
import * as paymentsService from "./payments.service.js";
import { constructStripeEvent } from "./stripe-webhook.handler.js";

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  }
  return req.user.id;
}

export async function createCheckoutHandler(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const input = parseBody(createCheckoutSchema, req.body);
  const result = await paymentsService.createCheckoutSession(userId, input.pendingReservationId);
  res.status(200).json(result);
}

export async function listPaymentsHandler(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const query = parseQuery(listPaymentsQuerySchema, req.query);
  const result = await paymentsReadService.listUserPayments(userId, query);
  res.status(200).json(result);
}

export async function getPaymentHandler(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const { id } = parseQuery(paymentIdParamSchema, { id: req.params.id });
  const payment = await paymentsReadService.getUserPayment(userId, id);
  res.status(200).json(payment);
}

export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    throw new AppError("Missing Stripe signature", 400, "STRIPE_SIGNATURE_INVALID");
  }

  const rawBody = req.body;
  if (!Buffer.isBuffer(rawBody)) {
    throw new AppError("Invalid webhook body", 400, "STRIPE_SIGNATURE_INVALID");
  }

  const event = constructStripeEvent(rawBody, signature);
  const { handleStripeWebhookEvent } = await import("./stripe-webhook.service.js");
  await handleStripeWebhookEvent(event);
  res.status(200).json({ received: true });
}
