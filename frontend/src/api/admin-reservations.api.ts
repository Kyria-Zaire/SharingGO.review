import { buildQuery } from "@/lib/build-query";
import type {
  AdminReservation,
  AdminReservationFilters,
  AdminReservationListResponse,
} from "@/types/reservations.types";
import { http } from "./http";

export async function listAdminReservations(
  filters: AdminReservationFilters = {}
): Promise<AdminReservationListResponse> {
  const query = buildQuery({
    status: filters.status,
    userId: filters.userId,
    tripId: filters.tripId,
    lineId: filters.lineId,
    from: filters.from,
    to: filters.to,
    limit: filters.limit !== undefined ? String(filters.limit) : undefined,
    offset: filters.offset !== undefined ? String(filters.offset) : undefined,
  });
  return http<AdminReservationListResponse>(`/api/admin/reservations${query}`);
}

export async function getAdminReservation(reservationId: string): Promise<AdminReservation> {
  return http<AdminReservation>(`/api/admin/reservations/${reservationId}`);
}
