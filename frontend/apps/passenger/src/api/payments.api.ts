import { http } from "@/api/http";
import { buildQuery } from "@/lib/build-query";
import type {
  CheckoutResponse,
  ListPaymentsQuery,
  ListPaymentsResponse,
  Payment,
} from "@/types/payments";

export async function createCheckoutSession(
  pendingReservationId: string
): Promise<CheckoutResponse> {
  return http<CheckoutResponse>("/api/payments/checkout", {
    method: "POST",
    body: { pendingReservationId },
  });
}

export async function listPayments(
  query: ListPaymentsQuery = {}
): Promise<ListPaymentsResponse> {
  const qs = buildQuery({
    status: query.status,
    type: query.type,
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
  });
  return http<ListPaymentsResponse>(`/api/payments${qs}`);
}

export async function getPayment(paymentId: string): Promise<Payment> {
  return http<Payment>(`/api/payments/${encodeURIComponent(paymentId)}`);
}
