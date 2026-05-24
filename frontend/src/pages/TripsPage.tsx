import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAdminTripOccupancy, listAdminLines, listAdminTrips } from "@/api/admin-trips.api";
import { ApiError } from "@/api/http";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { queryKeys } from "@/constants/query-keys";
import { OccupancyPanel } from "@/features/trips/components/OccupancyPanel";
import { TripsFilters } from "@/features/trips/components/TripsFilters";
import { TripsTable } from "@/features/trips/components/TripsTable";
import type { AdminTripsListFilters } from "@/types/trips.types";

const TRIPS_STALE_TIME_MS = 30_000;

export function TripsPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<AdminTripsListFilters>({
    includeDisabled: false,
  });
  const [occupancyTripId, setOccupancyTripId] = useState<string | null>(null);

  useEffect(() => {
    const tripId = searchParams.get("tripId");
    if (tripId) {
      setOccupancyTripId(tripId);
    }
  }, [searchParams]);

  const filterKey = useMemo(() => ({ ...filters }), [filters]);

  const tripsQuery = useQuery({
    queryKey: queryKeys.admin.trips.list(filterKey),
    queryFn: () => listAdminTrips(filters),
    staleTime: TRIPS_STALE_TIME_MS,
  });

  const linesQuery = useQuery({
    queryKey: queryKeys.admin.lines,
    queryFn: listAdminLines,
    staleTime: 5 * 60 * 1000,
  });

  const occupancyQuery = useQuery({
    queryKey: queryKeys.admin.trips.occupancy(occupancyTripId ?? ""),
    queryFn: () => getAdminTripOccupancy(occupancyTripId!),
    enabled: Boolean(occupancyTripId),
    staleTime: TRIPS_STALE_TIME_MS,
  });

  const trips = tripsQuery.data?.trips ?? [];

  return (
    <>
      <PageHeader
        title="Trajets"
        description="Supervision des trajets SharingGO"
      />

      <TripsFilters
        filters={filters}
        onChange={setFilters}
        lines={linesQuery.data?.lines ?? []}
        onRefresh={() => tripsQuery.refetch()}
        isRefreshing={tripsQuery.isFetching}
      />

      {tripsQuery.isLoading ? <TableSkeleton /> : null}

      {tripsQuery.isError ? (
        <ErrorState
          message={
            tripsQuery.error instanceof ApiError
              ? tripsQuery.error.message
              : "Impossible de charger les trajets"
          }
          onRetry={() => tripsQuery.refetch()}
        />
      ) : null}

      {!tripsQuery.isLoading && !tripsQuery.isError && trips.length === 0 ? (
        <EmptyState
          badge="Aucun trajet"
          title="Aucun trajet trouvé"
          description="Ajustez les filtres ou vérifiez que des trajets existent dans le seed demo."
        />
      ) : null}

      {!tripsQuery.isLoading && !tripsQuery.isError && trips.length > 0 ? (
        <TripsTable
          trips={trips}
          selectedOccupancyTripId={occupancyTripId}
          selectedTripOccupancy={occupancyQuery.data ?? null}
          onViewOccupancy={(id) =>
            setOccupancyTripId((current) => (current === id ? null : id))
          }
        />
      ) : null}

      <OccupancyPanel
        tripId={occupancyTripId}
        occupancy={occupancyQuery.data}
        isLoading={occupancyQuery.isLoading}
        isError={occupancyQuery.isError}
        error={occupancyQuery.error}
        onRetry={() => occupancyQuery.refetch()}
        onClose={() => setOccupancyTripId(null)}
      />
    </>
  );
}
