import type { PassengerUser } from "@/types/auth";
import { SUBSCRIPTION_CATALOG_PLANS } from "@/features/subscriptions/constants/subscriptions-content";
import { formatSubscriptionPrice } from "@/features/subscriptions/lib/subscription-format";
import type { SubscriptionType } from "@/types/subscriptions.types";

export function profileDisplayName(user: PassengerUser): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.email;
}

export function profileInitials(user: PassengerUser): string {
  const first = user.firstName?.charAt(0) ?? "";
  const last = user.lastName?.charAt(0) ?? "";
  if (first || last) return `${first}${last}`.toUpperCase();
  return (user.email.charAt(0) ?? "U").toUpperCase();
}

export function resolveSubscriptionPlanPrice(type: SubscriptionType): string {
  const plan = SUBSCRIPTION_CATALOG_PLANS.find((item) => item.apiType === type);
  if (!plan) return "—";
  return `${formatSubscriptionPrice(plan.priceMonthly)}/mois`;
}
