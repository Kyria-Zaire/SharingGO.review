import { buildQuery } from "@/lib/build-query";
import type {
  AdminLinesListResponse,
  AdminTrip,
  AdminTripListResponse,
  AdminTripsListFilters,
  TripOccupancy,
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
