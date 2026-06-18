import { http } from "@/api/http";
import { buildQuery } from "@/lib/build-query";
import type {
  CreatePendingReservationResponse,
  ListUserReservationsQuery,
  ListUserReservationsResponse,
  PendingReservation,
} from "@/types/reservations";

export async function createPendingReservation(
  tripId: string
): Promise<CreatePendingReservationResponse> {
  return http<CreatePendingReservationResponse>("/api/reservations/pending", {
    method: "POST",
    body: { tripId },
  });
}

export async function getPendingReservation(
  pendingReservationId: string
): Promise<PendingReservation> {
  return http<PendingReservation>(
    `/api/reservations/pending/${encodeURIComponent(pendingReservationId)}`
  );
}

export async function cancelPendingReservation(pendingReservationId: string): Promise<void> {
  await http<void>(`/api/reservations/pending/${encodeURIComponent(pendingReservationId)}`, {
    method: "DELETE",
  });
}

export async function listUserReservations(
  query: ListUserReservationsQuery = {}
): Promise<ListUserReservationsResponse> {
  const qs = buildQuery({
    status: query.status,
    upcoming: query.upcoming,
    past: query.past,
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
  });
  return http<ListUserReservationsResponse>(`/api/reservations${qs}`);
}
