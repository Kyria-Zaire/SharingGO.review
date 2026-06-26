export type SubscriptionType = "CONVOYEUR_MONTHLY" | "MOSOLF_MONTHLY";

export type SubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED"
  | "INCOMPLETE";

export interface SafeSubscription {
  id: string;
  type: SubscriptionType;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string;
  createdAt: string;
}

export interface SubscriptionMeResponse {
  subscription: SafeSubscription | null;
  isActive: boolean;
}

export interface SubscriptionCheckoutResponse {
  checkoutUrl: string;
  stripeCheckoutSessionId: string;
}

export type SubscriptionApiErrorCode =
  | "SUBSCRIPTION_ALREADY_ACTIVE"
  | "SUBSCRIPTION_NOT_ELIGIBLE"
  | "CHECKOUT_CREATE_FAILED"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN";
