import type { SafePaymentWithReservationDto } from "./payments.serializers.js";

export interface CreateCheckoutResult {
  checkoutUrl: string;
  stripeCheckoutSessionId: string;
}

export interface StripeCheckoutMetadata {
  pendingReservationId: string;
  userId: string;
  tripId: string;
}

export type PaymentDetailDto = SafePaymentWithReservationDto;

export interface ListPaymentsResult {
  payments: SafePaymentWithReservationDto[];
  limit: number;
  offset: number;
}
