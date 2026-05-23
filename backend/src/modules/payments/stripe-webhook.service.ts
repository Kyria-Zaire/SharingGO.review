import type Stripe from "stripe";
import { logger } from "../../lib/logger.js";
import {
  handleSubscriptionCheckoutSessionCompleted,
  handleStripeSubscriptionLifecycleEvent,
} from "../subscriptions/subscription-stripe-webhook.service.js";
import { handleTicketCheckoutSessionCompleted } from "./stripe-ticket-webhook.service.js";

export async function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription") {
        await handleSubscriptionCheckoutSessionCompleted(event, session);
      } else {
        await handleTicketCheckoutSessionCompleted(event, session);
      }
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await handleStripeSubscriptionLifecycleEvent(
        event,
        event.data.object as Stripe.Subscription
      );
      return;
    }
    default:
      logger.debug("Stripe webhook event ignored", { eventType: event.type });
  }
}
