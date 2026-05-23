import type { Subscription, SubscriptionStatus, SubscriptionType } from "@prisma/client";

export interface SafeSubscriptionDto {
  id: string;
  type: SubscriptionType;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string;
  createdAt: string;
}

export interface SubscriptionMeResponse {
  subscription: SafeSubscriptionDto | null;
  isActive: boolean;
}

export type SubscriptionRecord = Subscription;
