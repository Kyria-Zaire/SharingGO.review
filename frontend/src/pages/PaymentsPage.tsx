import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listAdminPayments } from "@/api/admin-payments.api";
import { ApiError } from "@/api/http";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { queryKeys } from "@/constants/query-keys";
import { PaymentsFilters } from "@/features/payments/components/PaymentsFilters";
import { PaymentsPageKpis } from "@/features/payments/components/PaymentsPageKpis";
import { PaymentsTable } from "@/features/payments/components/PaymentsTable";
import { computePaymentPageKpis } from "@/features/payments/utils/payment-page-kpis";
import { formatShortId } from "@/lib/format-id";
import type { AdminPaymentFilters } from "@/types/payments.types";

const PAYMENTS_STALE_TIME_MS = 30_000;
const DEFAULT_LIMIT = 50;

export function PaymentsPage() {
  const [searchParams] = useSearchParams();
  const highlightedPaymentId = searchParams.get("paymentId");
  const [filters, setFilters] = useState<AdminPaymentFilters>({
    limit: DEFAULT_LIMIT,
    offset: 0,
  });

  const filterKey = useMemo(() => ({ ...filters }), [filters]);

  const listQuery = useQuery({
    queryKey: queryKeys.admin.payments.list(filterKey),
    queryFn: () => listAdminPayments(filters),
    staleTime: PAYMENTS_STALE_TIME_MS,
  });

  const payments = listQuery.data?.payments ?? [];
  const isHighlightedPaymentVisible = highlightedPaymentId
    ? payments.some((payment) => payment.id === highlightedPaymentId)
    : false;
  const limit = filters.limit ?? DEFAULT_LIMIT;
  const offset = filters.offset ?? 0;
  const hasNextPage = payments.length >= limit;
  const pageKpis = useMemo(
    () => computePaymentPageKpis(listQuery.data?.payments ?? []),
    [listQuery.data?.payments]
  );

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

  return (
    <>
      <PageHeader
        title="Paiements"
        description="Suivi des paiements et accès SharingGO"
      />

      <PaymentsFilters
        filters={filters}
        onChange={setFilters}
        onRefresh={() => listQuery.refetch()}
        isRefreshing={listQuery.isFetching}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        hasNextPage={hasNextPage}
      />

      {listQuery.isLoading ? <TableSkeleton /> : null}

      {listQuery.isError ? (
        <ErrorState
          message={
            listQuery.error instanceof ApiError
              ? listQuery.error.message
              : "Impossible de charger les paiements"
          }
          onRetry={() => listQuery.refetch()}
        />
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && payments.length === 0 ? (
        <EmptyState
          badge="Aucun paiement"
          title="Aucun paiement trouvé"
          description="Ajustez les filtres ou vérifiez que des paiements existent dans le seed demo."
        />
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && highlightedPaymentId && !isHighlightedPaymentVisible ? (
        <p className="mb-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
          Paiement recherché #{formatShortId(highlightedPaymentId)} non visible sur cette page — ajustez
          pagination ou filtres.
        </p>
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && payments.length > 0 ? (
        <>
          <PaymentsPageKpis kpis={pageKpis} />
          <p className="mb-3 text-sm text-muted-foreground">
            {payments.length} paiement(s) — offset {offset}, limite {limit}
          </p>
          <PaymentsTable
            payments={payments}
            highlightedPaymentId={highlightedPaymentId}
          />
        </>
      ) : null}
    </>
  );
}
