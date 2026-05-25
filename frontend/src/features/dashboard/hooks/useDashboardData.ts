import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { listAdminActivityFeed } from "@/api/admin-activity.api";
import { listAdminIncidents } from "@/api/admin-incidents.api";
import { listAdminPayments } from "@/api/admin-payments.api";
import { fetchMonitoringSnapshot } from "@/api/system.api";
import { queryKeys } from "@/constants/query-keys";
import {
  DASHBOARD_ACTIVITY_PREVIEW_LIMIT,
  DASHBOARD_POLL_INTERVAL_MS,
} from "@/features/dashboard/constants/dashboard";
import { buildAttentionItems, countMonitoringWarnings } from "@/features/dashboard/utils/dashboard-attention";
import { computeDashboardKpis } from "@/features/dashboard/utils/dashboard-kpis";
import { startOfTodayIso } from "@/features/dashboard/utils/dashboard-date";
import { useDispatchStickySummary } from "@/features/dispatch/hooks/useDispatchStickySummary";
import { fetchDepartureBoard } from "@/features/departures/services/fetch-departure-board";
import { isCriticalOpen, isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import { mergeActivityFeedPages } from "@/features/dispatch/utils/merge-feed-events";
import type { DepartureTripView } from "@/types/departures.types";

export function useDashboardData(pollingEnabled: boolean) {
  const poll = pollingEnabled ? DASHBOARD_POLL_INTERVAL_MS : false;
  const sticky = useDispatchStickySummary();

  const departuresQuery = useQuery({
    queryKey: queryKeys.departures.board({ upcomingOnly: true, includeDisabled: false }),
    queryFn: () =>
      fetchDepartureBoard({
        upcomingOnly: true,
        includeDisabled: false,
      }),
    staleTime: DASHBOARD_POLL_INTERVAL_MS,
    refetchInterval: poll,
  });

  const incidentsQuery = useQuery({
    queryKey: queryKeys.incidents.list({ limit: 100, offset: 0 }),
    queryFn: () => listAdminIncidents({ limit: 100, offset: 0 }),
    staleTime: DASHBOARD_POLL_INTERVAL_MS,
    refetchInterval: poll,
  });

  const monitoringQuery = useQuery({
    queryKey: queryKeys.monitoring.snapshot,
    queryFn: fetchMonitoringSnapshot,
    staleTime: DASHBOARD_POLL_INTERVAL_MS,
    refetchInterval: poll,
  });

  const paymentsQuery = useQuery({
    queryKey: queryKeys.admin.payments.list({
      limit: 100,
      offset: 0,
      from: startOfTodayIso(),
    }),
    queryFn: () =>
      listAdminPayments({
        limit: 100,
        offset: 0,
        from: startOfTodayIso(),
      }),
    staleTime: DASHBOARD_POLL_INTERVAL_MS,
    refetchInterval: poll,
  });

  const feedQuery = useQuery({
    queryKey: queryKeys.dispatch.feed({ limit: DASHBOARD_ACTIVITY_PREVIEW_LIMIT, preview: true }),
    queryFn: () =>
      listAdminActivityFeed({
        limit: DASHBOARD_ACTIVITY_PREVIEW_LIMIT,
        offset: 0,
      }),
    staleTime: DASHBOARD_POLL_INTERVAL_MS,
    refetchInterval: poll,
  });

  const incidents = useMemo(
    () => incidentsQuery.data?.incidents ?? [],
    [incidentsQuery.data?.incidents]
  );
  const departures = useMemo(
    () => departuresQuery.data?.departures ?? [],
    [departuresQuery.data?.departures]
  );
  const payments = useMemo(
    () => paymentsQuery.data?.payments ?? [],
    [paymentsQuery.data?.payments]
  );
  const monitoring = monitoringQuery.data;

  const kpis = useMemo(
    () =>
      computeDashboardKpis({
        payments,
        departures,
        incidents,
      }),
    [payments, departures, incidents]
  );

  const attentionItems = useMemo(
    () =>
      buildAttentionItems({
        incidents,
        departures,
        monitoring,
      }),
    [incidents, departures, monitoring]
  );

  const tripsFullCount = useMemo(
    () => departures.filter((departure) => departure.isFull).length,
    [departures]
  );

  const boardingTrips = useMemo(
    () =>
      departures
        .filter((departure) => departure.readiness === "BOARDING_IN_PROGRESS")
        .slice(0, 4),
    [departures]
  );

  const nearDepartures = useMemo(
    () => departures.filter((departure) => departure.nearDeparture).slice(0, 4),
    [departures]
  );

  const criticalIncidents = useMemo(
    () => incidents.filter((incident) => isCriticalOpen(incident)).slice(0, 5),
    [incidents]
  );

  const activityEvents = useMemo(
    () => mergeActivityFeedPages(feedQuery.data ? [feedQuery.data] : []),
    [feedQuery.data]
  );

  const openIncidentCount = useMemo(
    () => incidents.filter((incident) => isOpenIncidentStatus(incident.status)).length,
    [incidents]
  );

  const isLoading =
    sticky.isLoading ||
    departuresQuery.isLoading ||
    incidentsQuery.isLoading ||
    monitoringQuery.isLoading ||
    paymentsQuery.isLoading ||
    feedQuery.isLoading;

  const isFetching =
    departuresQuery.isFetching ||
    incidentsQuery.isFetching ||
    monitoringQuery.isFetching ||
    paymentsQuery.isFetching ||
    feedQuery.isFetching;

  async function refetchAll(): Promise<void> {
    await Promise.all([
      departuresQuery.refetch(),
      incidentsQuery.refetch(),
      monitoringQuery.refetch(),
      paymentsQuery.refetch(),
      feedQuery.refetch(),
    ]);
  }

  return {
    sticky,
    kpis,
    attentionItems,
    tripsFullCount,
    monitoringWarningCount: countMonitoringWarnings(monitoring),
    boardingTrips,
    nearDepartures,
    criticalIncidents,
    activityEvents,
    openIncidentCount,
    monitoring,
    departures,
    isLoading,
    isFetching,
    refetchAll,
  };
}

export type { DepartureTripView };
