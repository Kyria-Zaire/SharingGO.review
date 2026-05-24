import { X } from "lucide-react";
import { ApiError } from "@/api/http";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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

export function ReservationDetailPanel({
  reservationId,
  reservation,
  isLoading,
  isError,
  error,
  onRetry,
  onClose,
}: ReservationDetailPanelProps) {
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
    <Card className="mt-6 border-primary/30">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Détails réservation</h3>
          <p className="text-sm text-muted-foreground">
            Données chargées à la demande — aucune donnée sensible exposée.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fermer">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement du détail…</p>
      ) : null}

      {isError ? (
        <ErrorState message={errorMessage} onRetry={onRetry} className="py-8" />
      ) : null}

      {reservation ? (
        <div className="space-y-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Réservation</dt>
              <dd className="font-mono font-medium text-foreground" title={reservation.id}>
                {formatShortId(reservation.id)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Statut</dt>
              <dd className="mt-1">
                <ReservationStatusBadge status={reservation.status} />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Passager</dt>
              <dd className="font-medium text-foreground">
                {formatPassengerLabel(reservation.user)}
              </dd>
              {reservation.user.email ? (
                <dd className="text-xs text-muted-foreground">{reservation.user.email}</dd>
              ) : null}
            </div>
            <div>
              <dt className="text-muted-foreground">Ligne</dt>
              <dd className="font-medium text-foreground">{reservation.trip.line.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Trajet</dt>
              <dd className="font-medium text-foreground">
                {reservation.trip.line.startCity} → {reservation.trip.line.endCity}
              </dd>
              <dd className="font-mono text-xs text-muted-foreground" title={reservation.trip.id}>
                {formatShortId(reservation.trip.id)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Départ</dt>
              <dd className="font-medium text-foreground">
                {formatDate(reservation.trip.departureTime)}
              </dd>
            </div>
          </dl>

          <section className="space-y-2">
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
            <section>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Utilisée par
              </h4>
              <p className="text-sm text-foreground">{formatPassengerLabel(reservation.usedBy)}</p>
            </section>
          ) : null}

          <ReservationTimeline reservation={reservation} />
        </div>
      ) : null}
    </Card>
  );
}
