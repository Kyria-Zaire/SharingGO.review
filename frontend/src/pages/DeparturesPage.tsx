import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { listAdminLines } from "@/api/admin-trips.api";
import { ApiError } from "@/api/http";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { queryKeys } from "@/constants/query-keys";
import { DepartureProgressCard } from "@/features/departures/components/DepartureProgressCard";
import { DeparturesFilters } from "@/features/departures/components/DeparturesFilters";
import { fetchDepartureBoard } from "@/features/departures/services/fetch-departure-board";
import { MonitoringLastUpdated } from "@/features/monitoring/components/MonitoringLastUpdated";
import type { DepartureFilters } from "@/types/departures.types";

const DEPARTURES_STALE_TIME_MS = 15_000;
const REFRESH_COOLDOWN_MS = 2_000;

export function DeparturesPage() {
  const [filters, setFilters] = useState<DepartureFilters>({
    upcomingOnly: true,
    includeDisabled: false,
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshCooldown, setRefreshCooldown] = useState(false);

  const filterKey = useMemo(() => ({ ...filters }), [filters]);

  const boardQuery = useQuery({
    queryKey: queryKeys.departures.board(filterKey),
    queryFn: () => fetchDepartureBoard(filters),
    staleTime: DEPARTURES_STALE_TIME_MS,
  });

  const linesQuery = useQuery({
    queryKey: queryKeys.admin.lines,
    queryFn: listAdminLines,
    staleTime: 5 * 60 * 1000,
  });

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

  const departures = boardQuery.data?.departures ?? [];

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
            <DepartureProgressCard key={view.tripId} view={view} />
          ))}
        </div>
      ) : null}
    </>
  );
}
