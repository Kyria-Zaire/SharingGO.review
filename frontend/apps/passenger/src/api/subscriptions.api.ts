import { http } from "@/api/http";
import type {
  SubscriptionCheckoutResponse,
  SubscriptionMeResponse,
  SubscriptionType,
} from "@/types/subscriptions.types";

export async function getSubscriptionMe(): Promise<SubscriptionMeResponse> {
  return http<SubscriptionMeResponse>("/api/subscriptions/me");
}

export async function createSubscriptionCheckout(
  type: SubscriptionType
): Promise<SubscriptionCheckoutResponse> {
  return http<SubscriptionCheckoutResponse>("/api/subscriptions/checkout", {
    method: "POST",
    body: { type },
  });
}
