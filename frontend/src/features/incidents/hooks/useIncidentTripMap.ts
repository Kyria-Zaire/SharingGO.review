import { useQuery } from "@tanstack/react-query";
import { listAdminTrips } from "@/api/admin-trips.api";
import { queryKeys } from "@/constants/query-keys";
import type { AdminTrip } from "@/types/trips.types";

export function useIncidentTripMap() {
  const query = useQuery({
    queryKey: queryKeys.admin.trips.list({ includeDisabled: true, incidentLookup: true }),
    queryFn: () => listAdminTrips({ includeDisabled: true }),
    staleTime: 60_000,
  });

  const tripById = new Map<string, AdminTrip>();
  for (const trip of query.data?.trips ?? []) {
    tripById.set(trip.id, trip);
  }

  return { tripById, isLoading: query.isLoading };
}
