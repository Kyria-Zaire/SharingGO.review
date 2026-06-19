import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { ApiError } from "@/api/http";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDate } from "@/lib/format-date";
import { formatShortId } from "@/lib/format-id";
import type { AdminReservation } from "@/types/reservations.types";
import { formatPassengerLabel } from "@/features/reservations/utils/passenger-label";
import { AccessTypeBadge } from "./AccessTypeBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { ReservationTimeline } from "./ReservationTimeline";

interface ReservationDetailPanelProps {
  reservationId: string | null;
  reservation: AdminReservation | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onClose: () => void;
}

function formatAmount(amount: string, currency: string): string {
  return `${amount} ${currency.toUpperCase()}`;
}

function ReservationDetailContent({ reservation }: { reservation: AdminReservation }) {
  return (
    <div className="space-y-6">
      <dl className="grid min-w-0 gap-4 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-muted-foreground">Réservation</dt>
          <dd className="break-all font-mono font-medium text-foreground" title={reservation.id}>
            {formatShortId(reservation.id)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Statut</dt>
          <dd className="mt-1">
            <ReservationStatusBadge status={reservation.status} />
          </dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-muted-foreground">Passager</dt>
          <dd className="font-medium text-foreground">
            {formatPassengerLabel(reservation.user)}
          </dd>
          {reservation.user.email ? (
            <dd className="break-all text-xs text-muted-foreground">{reservation.user.email}</dd>
          ) : null}
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">Ligne</dt>
          <dd className="font-medium text-foreground">{reservation.trip.line.name}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">Trajet</dt>
          <dd className="font-medium text-foreground">
            {reservation.trip.line.startCity} → {reservation.trip.line.endCity}
          </dd>
          <dd className="font-mono text-xs text-muted-foreground" title={reservation.trip.id}>
            {formatShortId(reservation.trip.id)}
          </dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-muted-foreground">Départ</dt>
          <dd className="font-medium text-foreground">
            {formatDate(reservation.trip.departureTime)}
          </dd>
        </div>
      </dl>

      <section className="min-w-0 space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Paiement
        </h4>
        {reservation.payment ? (
          <div className="flex flex-wrap items-center gap-2">
            <AccessTypeBadge type={reservation.payment.type} />
            <PaymentStatusBadge status={reservation.payment.status} />
            <span className="text-sm text-foreground">
              {formatAmount(reservation.payment.amount, reservation.payment.currency)}
            </span>
            <span className="font-mono text-xs text-muted-foreground" title={reservation.payment.id}>
              {formatShortId(reservation.payment.id)}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun paiement associé</p>
        )}
      </section>

      {reservation.usedBy ? (
        <section className="min-w-0">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Utilisée par
          </h4>
          <p className="text-sm text-foreground">{formatPassengerLabel(reservation.usedBy)}</p>
        </section>
      ) : null}

      <ReservationTimeline reservation={reservation} />
    </div>
  );
}

export function ReservationDetailPanel({
  reservationId,
  reservation,
  isLoading,
  isError,
  error,
  onRetry,
  onClose,
}: ReservationDetailPanelProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reservationId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.querySelector<HTMLButtonElement>('[aria-label="Fermer"]')?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reservationId, onClose]);

  if (!reservationId) {
    return null;
  }

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Impossible de charger la réservation";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center lg:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Fermer le détail réservation"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-detail-title"
        className="relative z-10 flex max-h-[min(92dvh,100%)] w-full min-w-0 flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl lg:max-h-[min(85vh,48rem)] lg:max-w-2xl lg:rounded-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
          <div className="min-w-0 pr-2">
            <h3 id="reservation-detail-title" className="text-lg font-semibold text-foreground">
              Détails réservation
            </h3>
            <p className="text-sm text-muted-foreground">
              Données chargées à la demande — aucune donnée sensible exposée.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement du détail…</p>
          ) : null}

          {isError ? (
            <ErrorState message={errorMessage} onRetry={onRetry} className="py-8" />
          ) : null}

          {reservation ? <ReservationDetailContent reservation={reservation} /> : null}
        </div>
      </div>
    </div>
  );
}
