import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { listAdminLines } from "@/api/admin-trips.api";
import { ApiError } from "@/api/http";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { queryKeys } from "@/constants/query-keys";
import { DepartureProgressCard } from "@/features/departures/components/DepartureProgressCard";
import { DeparturesFilters } from "@/features/departures/components/DeparturesFilters";
import { PromoteHeuristicDialog } from "@/features/departures/components/PromoteHeuristicDialog";
import { useDeparturePromotedIncidents } from "@/features/departures/hooks/useDeparturePromotedIncidents";
import { usePromoteHeuristic } from "@/features/departures/hooks/usePromoteHeuristic";
import { fetchDepartureBoard } from "@/features/departures/services/fetch-departure-board";
import { promotedIncidentKey } from "@/features/departures/utils/promoted-incident-utils";
import { useTripLifecycleActions } from "@/features/departures/hooks/useTripLifecycleActions";
import { IncidentToast } from "@/features/incidents/components/IncidentToast";
import { MonitoringLastUpdated } from "@/features/monitoring/components/MonitoringLastUpdated";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { DepartureFilters, DepartureTripView } from "@/types/departures.types";
import type { HeuristicKind } from "@/types/incidents.types";

const DEPARTURES_STALE_TIME_MS = 15_000;
const REFRESH_COOLDOWN_MS = 2_000;

export function DeparturesPage() {
  const [filters, setFilters] = useState<DepartureFilters>({
    upcomingOnly: true,
    includeDisabled: false,
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshCooldown, setRefreshCooldown] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState<DepartureTripView | null>(null);

  const userQuery = useCurrentUser();
  const {
    promote,
    isPromoting,
    toastMessage,
    duplicateMessage,
    dismissToast,
    clearDuplicateMessage,
  } = usePromoteHeuristic();

  const filterKey = useMemo(() => ({ ...filters }), [filters]);

  const boardQuery = useQuery({
    queryKey: queryKeys.departures.board(filterKey),
    queryFn: () => fetchDepartureBoard(filters),
    staleTime: DEPARTURES_STALE_TIME_MS,
  });

  const refreshDeparturesBoard = useCallback(async () => {
    await boardQuery.refetch();
    setLastUpdated(new Date());
  }, [boardQuery]);

  const {
    runLifecycleAction,
    isLifecyclePending,
    toastMessage: lifecycleToastMessage,
    dismissToast: dismissLifecycleToast,
  } = useTripLifecycleActions(refreshDeparturesBoard);

  const linesQuery = useQuery({
    queryKey: queryKeys.admin.lines,
    queryFn: listAdminLines,
    staleTime: 5 * 60 * 1000,
  });

  const departures = useMemo(
    () => boardQuery.data?.departures ?? [],
    [boardQuery.data?.departures]
  );
  const tripIds = useMemo(() => departures.map((view) => view.tripId), [departures]);
  const { promotedMap } = useDeparturePromotedIncidents(tripIds, departures.length > 0);

  useEffect(() => {
    if (boardQuery.isSuccess || boardQuery.isError) {
      setLastUpdated(new Date());
    }
  }, [boardQuery.dataUpdatedAt, boardQuery.isSuccess, boardQuery.isError]);

  function handleRefresh() {
    if (refreshCooldown) return;
    setRefreshCooldown(true);
    void boardQuery.refetch().finally(() => {
      setLastUpdated(new Date());
      setTimeout(() => setRefreshCooldown(false), REFRESH_COOLDOWN_MS);
    });
  }

  const promoteHeuristicOptions = useMemo((): HeuristicKind[] => {
    if (!promoteTarget) return [];
    return promoteTarget.incidents
      .filter(
        (incident) =>
          !promotedMap.has(promotedIncidentKey(promoteTarget.tripId, incident.heuristicKind))
      )
      .map((incident) => incident.heuristicKind);
  }, [promoteTarget, promotedMap]);

  async function handlePromoteSubmit(heuristicKind: HeuristicKind) {
    if (!promoteTarget) return;
    clearDuplicateMessage();
    try {
      await promote({
        relatedTripId: promoteTarget.tripId,
        heuristicKind,
      });
      setPromoteTarget(null);
    } catch {
      // erreurs gérées dans le hook (toast / duplicateMessage)
    }
  }

  return (
    <>
      <PageHeader
        title="Departures"
        description="Préparation départ — readiness boarding et supervision embarquement"
      />

      <div className="mb-4">
        <MonitoringLastUpdated at={lastUpdated} />
      </div>

      <DeparturesFilters
        filters={filters}
        onChange={setFilters}
        lines={linesQuery.data?.lines ?? []}
        onRefresh={handleRefresh}
        isRefreshing={boardQuery.isFetching}
        refreshDisabled={refreshCooldown}
      />

      {boardQuery.isLoading ? <TableSkeleton /> : null}

      {boardQuery.isError ? (
        <ErrorState
          message={
            boardQuery.error instanceof ApiError
              ? boardQuery.error.message
              : "Impossible de charger le board départs"
          }
          onRetry={handleRefresh}
        />
      ) : null}

      {!boardQuery.isLoading && !boardQuery.isError && departures.length === 0 ? (
        <EmptyState
          badge="Aucun départ"
          title="Aucun trajet opérationnel"
          description="Ajustez les filtres ou vérifiez qu'il existe des trajets à venir dans le seed demo."
        />
      ) : null}

      {!boardQuery.isLoading && !boardQuery.isError && departures.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departures.map((view) => (
            <DepartureProgressCard
              key={view.tripId}
              view={view}
              userType={userQuery.data?.userType}
              promotedMap={promotedMap}
              onPromote={setPromoteTarget}
              isLifecyclePending={isLifecyclePending}
              onLifecycleAction={async (tripId, action, reason) => {
                await runLifecycleAction({ tripId, action, reason });
              }}
            />
          ))}
        </div>
      ) : null}

      <PromoteHeuristicDialog
        view={promoteTarget}
        heuristicOptions={promoteHeuristicOptions}
        open={promoteTarget !== null && promoteHeuristicOptions.length > 0}
        isSubmitting={isPromoting}
        errorMessage={duplicateMessage}
        onClose={() => {
          clearDuplicateMessage();
          setPromoteTarget(null);
        }}
        onSubmit={(heuristicKind) => void handlePromoteSubmit(heuristicKind)}
      />

      <IncidentToast message={toastMessage} onDismiss={dismissToast} />
      <IncidentToast message={lifecycleToastMessage} onDismiss={dismissLifecycleToast} />
    </>
  );
}
