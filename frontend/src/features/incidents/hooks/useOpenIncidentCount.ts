import { useQuery } from "@tanstack/react-query";
import { listAdminIncidents } from "@/api/admin-incidents.api";
import { queryKeys } from "@/constants/query-keys";
import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";

export function useOpenIncidentCount(): number {
  const query = useQuery({
    queryKey: queryKeys.incidents.openCount,
    queryFn: () => listAdminIncidents({ limit: 100, offset: 0 }),
    staleTime: 15_000,
  });

  return (query.data?.incidents ?? []).filter((incident) =>
    isOpenIncidentStatus(incident.status)
  ).length;
}
