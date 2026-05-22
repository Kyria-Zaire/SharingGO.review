import type Stripe from "stripe";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { getStripeClient } from "./stripe.service.js";

export function constructStripeEvent(rawBody: Buffer, signature: string): Stripe.Event {
  try {
    return getStripeClient().webhooks.constructEvent(
      rawBody,
      signature,
      env.stripeWebhookSecret
    );
  } catch {
    logger.warn("Stripe webhook signature verification failed");
    throw new AppError("Invalid Stripe signature", 400, "STRIPE_SIGNATURE_INVALID");
  }
}
