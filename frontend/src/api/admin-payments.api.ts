import { buildQuery } from "@/lib/build-query";
import type {
  AdminPaymentFilters,
  AdminPaymentListResponse,
} from "@/types/payments.types";
import { http } from "./http";

export async function listAdminPayments(
  filters: AdminPaymentFilters = {}
): Promise<AdminPaymentListResponse> {
  const query = buildQuery({
    status: filters.status,
    type: filters.type,
    userId: filters.userId,
    reservationId: filters.reservationId,
    from: filters.from,
    to: filters.to,
    limit: filters.limit !== undefined ? String(filters.limit) : undefined,
    offset: filters.offset !== undefined ? String(filters.offset) : undefined,
  });
  return http<AdminPaymentListResponse>(`/api/admin/payments${query}`);
}
