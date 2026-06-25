import { useQuery } from "@tanstack/react-query";
import { fetchPublicTrips } from "@/api/trips.api";
import { mergeTripsWithUiDemo } from "@/features/trips/demo/merge-demo-trips";
import { queryKeys } from "@/constants/query-keys";
import type { TripsDateFilterValue } from "@/types/trips.types";

const PUBLIC_TRIPS_STALE_MS = 30_000;

export function usePublicTrips(dateFilter: TripsDateFilterValue) {
  const filterKey = { date: dateFilter.dateKey };

  return useQuery({
    queryKey: queryKeys.trips.list(filterKey),
    queryFn: async () => {
      const response = await fetchPublicTrips({ date: dateFilter.dateKey, limit: 50 });
      return {
        ...response,
        trips: mergeTripsWithUiDemo(response.trips, { dateKey: dateFilter.dateKey }),
      };
    },
    staleTime: PUBLIC_TRIPS_STALE_MS,
  });
}
