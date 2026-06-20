import { useQuery } from "@tanstack/react-query";
import { listAdminIncidents } from "@/api/admin-incidents.api";
import { queryKeys } from "@/constants/query-keys";
import { buildPromotedIncidentMap } from "@/features/departures/utils/promoted-incident-utils";

const PROMOTED_INCIDENTS_STALE_MS = 15_000;

export function useDeparturePromotedIncidents(tripIds: string[], enabled = true) {
  const filterKey = {
    source: "DEPARTURE_HEURISTIC" as const,
    status: "OPEN" as const,
    limit: 100,
    offset: 0,
  };

  const query = useQuery({
    queryKey: queryKeys.incidents.list(filterKey),
    queryFn: async () => {
      const [open, inProgress] = await Promise.all([
        listAdminIncidents({ ...filterKey, status: "OPEN" }),
        listAdminIncidents({ ...filterKey, status: "IN_PROGRESS" }),
      ]);
      return {
        incidents: [...open.incidents, ...inProgress.incidents],
        limit: filterKey.limit,
        offset: 0,
      };
    },
    enabled: enabled && tripIds.length > 0,
    staleTime: PROMOTED_INCIDENTS_STALE_MS,
    select: (data) => {
      const tripIdSet = new Set(tripIds);
      const relevant = data.incidents.filter(
        (incident) => incident.relatedTripId && tripIdSet.has(incident.relatedTripId)
      );
      return buildPromotedIncidentMap(relevant);
    },
  });

  return {
    promotedMap: query.data ?? new Map(),
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
