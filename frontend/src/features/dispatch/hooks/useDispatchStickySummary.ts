import { useQuery } from "@tanstack/react-query";
import { listAdminIncidents } from "@/api/admin-incidents.api";
import { queryKeys } from "@/constants/query-keys";
import { fetchDepartureBoard } from "@/features/departures/services/fetch-departure-board";
import { isCriticalOpen, isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";

const STICKY_STALE_MS = 30_000;

export interface DispatchStickySummaryData {
  criticalOpenCount: number;
  nearDepartureCount: number;
  activeBoardingCount: number;
  isLoading: boolean;
}

export function useDispatchStickySummary(): DispatchStickySummaryData {
  const incidentsQuery = useQuery({
    queryKey: queryKeys.incidents.list({ limit: 100, offset: 0 }),
    queryFn: () => listAdminIncidents({ limit: 100, offset: 0 }),
    staleTime: STICKY_STALE_MS,
  });

  const departuresQuery = useQuery({
    queryKey: queryKeys.departures.board({ upcomingOnly: true, includeDisabled: false }),
    queryFn: () =>
      fetchDepartureBoard({
        upcomingOnly: true,
        includeDisabled: false,
      }),
    staleTime: STICKY_STALE_MS,
  });

  const incidents = incidentsQuery.data?.incidents ?? [];
  const departures = departuresQuery.data?.departures ?? [];

  const criticalOpenCount = incidents.filter(
    (incident) => isOpenIncidentStatus(incident.status) && isCriticalOpen(incident)
  ).length;

  const nearDepartureCount = departures.filter((view) => view.nearDeparture).length;

  const activeBoardingCount = departures.filter(
    (view) => view.readiness === "BOARDING_IN_PROGRESS"
  ).length;

  return {
    criticalOpenCount,
    nearDepartureCount,
    activeBoardingCount,
    isLoading: incidentsQuery.isLoading || departuresQuery.isLoading,
  };
}
