export interface CreateCheckoutResult {
  checkoutUrl: string;
  stripeCheckoutSessionId: string;
}

export interface StripeCheckoutMetadata {
  pendingReservationId: string;
  userId: string;
  tripId: string;
}
