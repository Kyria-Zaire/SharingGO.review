import { http } from "@/api/http";
import { buildQuery } from "@/lib/build-query";
import type { PublicTrip, PublicTripsListResponse, PublicTripsQuery } from "@/types/trips.types";

export async function fetchPublicTrips(
  query: PublicTripsQuery = {}
): Promise<PublicTripsListResponse> {
  const qs = buildQuery({
    date: query.date,
    from: query.from,
    to: query.to,
    lineId: query.lineId,
    limit: query.limit ?? 50,
    offset: query.offset ?? 0,
  });
  return http<PublicTripsListResponse>(`/api/trips${qs}`);
}

export async function fetchPublicTrip(tripId: string): Promise<PublicTrip> {
  return http<PublicTrip>(`/api/trips/${encodeURIComponent(tripId)}`);
}
