import type { AdminUserMinimal } from "@/types/reservations.types";

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export type PaymentType = "TICKET" | "SUBSCRIPTION" | "SUBSCRIPTION_ACCESS";

export interface AdminPayment {
  id: string;
  status: PaymentStatus;
  type: PaymentType;
  amount: string;
  currency: string;
  createdAt: string;
  reservationId: string | null;
  user: AdminUserMinimal;
  stripePaymentIntentRef: string | null;
  stripeCheckoutSessionRef: string | null;
}

export interface AdminPaymentListResponse {
  payments: AdminPayment[];
  limit: number;
  offset: number;
}

export interface AdminPaymentFilters {
  status?: PaymentStatus;
  type?: PaymentType;
  userId?: string;
  reservationId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface PaymentPageKpis {
  total: number;
  succeeded: number;
  failed: number;
  amountTotal: number;
  currency: string;
}
