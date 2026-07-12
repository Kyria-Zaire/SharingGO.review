import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listAdminReservations } from "@/api/admin-reservations.api";
import { ApiError } from "@/api/http";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { queryKeys } from "@/constants/query-keys";
import { formatPassengerLabel } from "@/features/reservations/utils/passenger-label";
import { RefundActionModal } from "@/features/reservations/components/RefundActionModal";
import { RefundQueueTable } from "@/features/reservations/components/RefundQueueTable";
import { RefundToast } from "@/features/reservations/components/RefundToast";
import { useRefundQueueActions } from "@/features/reservations/hooks/useRefundQueueActions";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { formatShortId } from "@/lib/format-id";
import type { AdminReservation, AdminReservationFilters, RefundActionKind } from "@/types/reservations.types";

const REFUND_QUEUE_STALE_TIME_MS = 15_000;
const REFUND_QUEUE_FILTERS = {
  refundStatus: "PENDING",
  limit: 100,
  offset: 0,
} satisfies AdminReservationFilters;

interface ActiveAction {
  reservation: AdminReservation;
  kind: RefundActionKind;
}

export function RefundQueuePage() {
  const [activeAction, setActiveAction] = useState<ActiveAction | null>(null);
  const { confirmAction, refreshQueue, toastMessage, dismissToast } = useRefundQueueActions();

  const listQuery = useQuery({
    queryKey: queryKeys.admin.reservations.list(REFUND_QUEUE_FILTERS),
    queryFn: () => listAdminReservations(REFUND_QUEUE_FILTERS),
    staleTime: REFUND_QUEUE_STALE_TIME_MS,
  });

  const reservations = listQuery.data?.reservations ?? [];

  function resolveListErrorMessage(): string {
    if (!(listQuery.error instanceof ApiError)) {
      return "Impossible de charger les réservations à traiter";
    }
    return listQuery.error.message;
  }

  return (
    <>
      <PageHeader
        title="Annulations à traiter"
        description="Réservations annulées en attente de remboursement ou d'avoir"
      />

      {listQuery.isLoading ? <TableSkeleton columns={5} /> : null}

      {listQuery.isError ? (
        <ErrorState message={resolveListErrorMessage()} onRetry={() => listQuery.refetch()} />
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && reservations.length === 0 ? (
        <EmptyState
          badge="File vide"
          title="Aucune annulation à traiter"
          description="Toutes les réservations annulées ont été remboursées ou créditées."
        />
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && reservations.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {reservations.length} réservation(s) en attente
          </p>
          <RefundQueueTable
            reservations={reservations}
            onAction={(reservation, kind) => setActiveAction({ reservation, kind })}
          />
        </>
      ) : null}

      {activeAction ? (
        <RefundActionModal
          reservation={{
            id: activeAction.reservation.id,
            passengerName: formatPassengerLabel(activeAction.reservation.user),
            tripLabel: `${activeAction.reservation.trip.line.name} · ${activeAction.reservation.trip.line.startCity} → ${activeAction.reservation.trip.line.endCity}`,
            amountLabel: activeAction.reservation.payment
              ? formatCurrency(
                  activeAction.reservation.payment.amount,
                  activeAction.reservation.payment.currency
                )
              : "—",
            paymentRefLabel: activeAction.reservation.payment
              ? `#${formatShortId(activeAction.reservation.payment.id)} · payé le ${formatDate(activeAction.reservation.payment.createdAt)}`
              : "Aucun paiement associé",
          }}
          kind={activeAction.kind}
          onConfirm={confirmAction}
          onClose={() => setActiveAction(null)}
          onRefresh={refreshQueue}
        />
      ) : null}

      <RefundToast message={toastMessage} onDismiss={dismissToast} />
    </>
  );
}
