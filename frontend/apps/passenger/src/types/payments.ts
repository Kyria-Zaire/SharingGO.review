/** POST /api/payments/checkout — backend `CheckoutResult`. */
export interface CheckoutResponse {
  checkoutUrl: string;
  stripeCheckoutSessionId: string;
}

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export type PaymentType = "TICKET" | "SUBSCRIPTION" | "SUBSCRIPTION_ACCESS";

export interface PaymentTripLine {
  id: string;
  name: string;
  startCity: string;
  endCity: string;
}

export interface PaymentReservationTrip {
  id: string;
  departureTime: string;
  arrivalTime: string | null;
  line: PaymentTripLine;
}

export interface PaymentReservation {
  id: string;
  status: string;
  trip: PaymentReservationTrip;
}

export interface Payment {
  id: string;
  status: PaymentStatus;
  type: PaymentType;
  amount: string;
  currency: string;
  createdAt: string;
  reservation: PaymentReservation | null;
}

export interface ListPaymentsQuery {
  status?: PaymentStatus;
  type?: PaymentType;
  limit?: number;
  offset?: number;
}

export interface ListPaymentsResponse {
  payments: Payment[];
  limit: number;
  offset: number;
}

export type PaymentApiErrorCode =
  | "PENDING_NOT_FOUND"
  | "PENDING_EXPIRED"
  | "PENDING_ALREADY_CONSUMED"
  | "FORBIDDEN"
  | "TRIP_FULL"
  | "TRIP_DISABLED"
  | "TRIP_PAST"
  | "CHECKOUT_CREATE_FAILED"
  | "PAYMENT_NOT_FOUND"
  | "RATE_LIMITED_CHECKOUT"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN";
