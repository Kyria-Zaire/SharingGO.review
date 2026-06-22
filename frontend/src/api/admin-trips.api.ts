import { buildQuery } from "@/lib/build-query";
import type {
  AdminLinesListResponse,
  AdminTrip,
  AdminTripListResponse,
  AdminTripsListFilters,
  TripOccupancy,
  TripLifecycleStatus,
} from "@/types/trips.types";
import { http } from "./http";

export async function listAdminTrips(filters: AdminTripsListFilters = {}): Promise<AdminTripListResponse> {
  const query = buildQuery({
    lineId: filters.lineId,
    from: filters.from,
    to: filters.to,
    includeDisabled: filters.includeDisabled ? "true" : undefined,
  });
  return http<AdminTripListResponse>(`/api/admin/trips${query}`);
}

export async function listAdminLines(): Promise<AdminLinesListResponse> {
  return http<AdminLinesListResponse>("/api/admin/lines");
}

export async function getAdminTripOccupancy(tripId: string): Promise<TripOccupancy> {
  return http<TripOccupancy>(`/api/admin/trips/${tripId}/occupancy`);
}

export async function disableAdminTrip(tripId: string): Promise<{ trip: AdminTrip }> {
  return http<{ trip: AdminTrip }>(`/api/admin/trips/${tripId}/disable`, { method: "POST" });
}

export async function enableAdminTrip(tripId: string): Promise<{ trip: AdminTrip }> {
  return http<{ trip: AdminTrip }>(`/api/admin/trips/${tripId}/enable`, { method: "POST" });
}

export interface CancelTripPayload {
  reason: string;
}

export async function startBoardingAdminTrip(tripId: string): Promise<{ trip: AdminTrip }> {
  return http<{ trip: AdminTrip }>(`/api/admin/trips/${tripId}/start-boarding`, { method: "POST" });
}

export async function departAdminTrip(tripId: string): Promise<{ trip: AdminTrip }> {
  return http<{ trip: AdminTrip }>(`/api/admin/trips/${tripId}/depart`, { method: "POST" });
}

export async function completeAdminTrip(tripId: string): Promise<{ trip: AdminTrip }> {
  return http<{ trip: AdminTrip }>(`/api/admin/trips/${tripId}/complete`, { method: "POST" });
}

export async function cancelAdminTrip(
  tripId: string,
  payload: CancelTripPayload
): Promise<{ trip: AdminTrip }> {
  return http<{ trip: AdminTrip }>(`/api/admin/trips/${tripId}/cancel`, {
    method: "POST",
    body: payload,
  });
}

export function isTerminalLifecycle(status: TripLifecycleStatus): boolean {
  return status === "COMPLETED" || status === "CANCELLED";
}
