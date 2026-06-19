import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAdminReservation, listAdminReservations } from "@/api/admin-reservations.api";
import { listAdminLines } from "@/api/admin-trips.api";
import { ApiError } from "@/api/http";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { queryKeys } from "@/constants/query-keys";
import { ReservationDetailPanel } from "@/features/reservations/components/ReservationDetailPanel";
import { ReservationsFilters } from "@/features/reservations/components/ReservationsFilters";
import { ReservationsTable } from "@/features/reservations/components/ReservationsTable";
import type { AdminReservationFilters } from "@/types/reservations.types";

const RESERVATIONS_STALE_TIME_MS = 30_000;
const DEFAULT_LIMIT = 50;

export function ReservationsPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<AdminReservationFilters>({
    limit: DEFAULT_LIMIT,
    offset: 0,
  });
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);

  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) {
      setSelectedReservationId(selected);
    }
  }, [searchParams]);

  const filterKey = useMemo(() => ({ ...filters }), [filters]);

  const listQuery = useQuery({
    queryKey: queryKeys.admin.reservations.list(filterKey),
    queryFn: () => listAdminReservations(filters),
    staleTime: RESERVATIONS_STALE_TIME_MS,
  });

  const linesQuery = useQuery({
    queryKey: queryKeys.admin.lines,
    queryFn: listAdminLines,
    staleTime: 5 * 60 * 1000,
  });

  const detailQuery = useQuery({
    queryKey: queryKeys.admin.reservations.detail(selectedReservationId ?? ""),
    queryFn: () => getAdminReservation(selectedReservationId!),
    enabled: Boolean(selectedReservationId),
    staleTime: RESERVATIONS_STALE_TIME_MS,
  });

  const reservations = listQuery.data?.reservations ?? [];
  const limit = filters.limit ?? DEFAULT_LIMIT;
  const offset = filters.offset ?? 0;
  const hasNextPage = reservations.length >= limit;

  function handlePrevPage() {
    setFilters((current) => ({
      ...current,
      offset: Math.max(0, (current.offset ?? 0) - (current.limit ?? DEFAULT_LIMIT)),
    }));
  }

  function handleNextPage() {
    setFilters((current) => ({
      ...current,
      offset: (current.offset ?? 0) + (current.limit ?? DEFAULT_LIMIT),
    }));
  }

  function handleViewDetail(reservationId: string) {
    setSelectedReservationId(reservationId);
  }

  function resolveListErrorMessage(): string {
    if (!(listQuery.error instanceof ApiError)) {
      return "Impossible de charger les réservations";
    }
    if (listQuery.error.status === 400) {
      return "Filtres invalides. Vérifiez les champs statut, dates et identifiants.";
    }
    return listQuery.error.message;
  }

  return (
    <>
      <PageHeader
        title="Réservations"
        description="Suivi opérationnel des réservations SharingGO"
      />

      <ReservationsFilters
        filters={filters}
        onChange={setFilters}
        lines={linesQuery.data?.lines ?? []}
        onRefresh={() => listQuery.refetch()}
        isRefreshing={listQuery.isFetching}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        hasNextPage={hasNextPage}
      />

      {listQuery.isLoading ? <TableSkeleton /> : null}

      {listQuery.isError ? (
        <ErrorState
          message={resolveListErrorMessage()}
          onRetry={() => listQuery.refetch()}
        />
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && reservations.length === 0 ? (
        <EmptyState
          badge="Aucune réservation"
          title="Aucune réservation trouvée"
          description="Ajustez les filtres ou vérifiez que des réservations existent dans le seed demo."
        />
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && reservations.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {reservations.length} réservation(s) — offset {offset}, limite {limit}
          </p>
          <ReservationsTable
            reservations={reservations}
            selectedReservationId={selectedReservationId}
            onViewDetail={handleViewDetail}
          />
        </>
      ) : null}

      <ReservationDetailPanel
        reservationId={selectedReservationId}
        reservation={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        error={detailQuery.error}
        onRetry={() => detailQuery.refetch()}
        onClose={() => setSelectedReservationId(null)}
      />
    </>
  );
}
