import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicTrips } from "@/api/trips.api";
import { queryKeys } from "@/constants/query-keys";
import { deriveTripAvailability, sortTripsByDeparture } from "@/lib/trip-availability";

const PUBLIC_TRIPS_STALE_MS = 30_000;

export const LANDING_DEPARTURES_LIMIT = 4;

/**
 * Prochains départs landing : 4 prochains créneaux à venir (tous jours confondus).
 * Une seule requête API via `from=now` — évite les appels parallèles instables.
 */
export function useLandingUpcomingTrips(limit = LANDING_DEPARTURES_LIMIT) {
  const query = useQuery({
    queryKey: queryKeys.trips.list({ landingUpcoming: true, limit }),
    queryFn: () =>
      fetchPublicTrips({
        from: new Date().toISOString(),
        limit: 50,
      }),
    staleTime: PUBLIC_TRIPS_STALE_MS,
  });

  const trips = useMemo(() => {
    const merged = query.data?.trips ?? [];
    return sortTripsByDeparture(merged)
      .filter((trip) => deriveTripAvailability(trip).status !== "past")
      .slice(0, limit);
  }, [query.data, limit]);

  return {
    trips,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: () => query.refetch(),
  };
}
