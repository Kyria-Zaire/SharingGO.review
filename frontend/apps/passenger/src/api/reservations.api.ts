import { http } from "@/api/http";
import type {
  CreatePendingReservationResponse,
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
