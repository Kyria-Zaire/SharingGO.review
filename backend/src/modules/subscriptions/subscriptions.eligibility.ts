import { SubscriptionType, type User } from "@prisma/client";
import { AppError } from "../../lib/errors.js";

/**
 * Mosolf eligibility V1 (S2-T8B).
 * Full promo / personal code flow is a future ticket.
 */
export function assertSubscriptionEligibility(
  user: Pick<User, "email">,
  type: SubscriptionType
): void {
  if (type === SubscriptionType.CONVOYEUR_MONTHLY) {
    return;
  }

  if (type === SubscriptionType.MOSOLF_MONTHLY) {
    const email = user.email.toLowerCase();
    if (email.endsWith("@mosolf.com") || email.endsWith("@sharinggo.demo")) {
      return;
    }
    throw new AppError(
      "Not eligible for Mosolf subscription",
      403,
      "SUBSCRIPTION_NOT_ELIGIBLE"
    );
  }
}
