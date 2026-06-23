import { ChevronLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "@/api/http";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { useUserReservation } from "@/hooks/useUserReservation";
import {
  formatDate,
  formatDayLabel,
  formatTime,
  formatTripDuration,
} from "@/lib/format-date";
import {
  formatPaymentAmount,
  getPaymentStatusLabel,
  getReservationStatusView,
} from "@/lib/reservation-status";
import { passengerTwoColumnClass } from "@/lib/passenger-layout";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import type { ReservationStatus } from "@/types/reservations";
import { ROUTES } from "@/types/routes";

function BookingDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement de la réservation">
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

function StatusMessage({ status }: { status: string }) {
  const normalized = status as ReservationStatus;

  if (normalized === "USED") {
    return (
      <Card className="border-border bg-muted/40 p-4 text-center">
        <p className="text-sm font-medium text-foreground">Billet utilisé</p>
        <p className="mt-1 text-xs text-muted-foreground">
          L&apos;embarquement a déjà été enregistré pour ce trajet.
        </p>
      </Card>
    );
  }

  if (normalized === "CANCELED") {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-4 text-center">
        <p className="text-sm font-medium text-destructive">Réservation annulée</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ce billet n&apos;est plus valide pour voyager.
        </p>
      </Card>
    );
  }

  if (normalized === "CONFIRMED") {
    return null;
  }

  return (
    <Card className="border-border bg-muted/40 p-4 text-center">
      <p className="text-sm text-muted-foreground">
        Statut de réservation : {getReservationStatusView(status).label}
      </p>
    </Card>
  );
}

export function BookingDetailPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const reservationQuery = useUserReservation(reservationId);

  const isNotFound =
    reservationQuery.error instanceof ApiError &&
    reservationQuery.error.code === "RESERVATION_NOT_FOUND";

  const errorMessage = isNotFound
    ? USER_MESSAGES.reservationNotFound
    : formatUserFacingError(reservationQuery.error, USER_MESSAGES.reservationLoad);

  const reservation = reservationQuery.data;
  const statusView = reservation ? getReservationStatusView(reservation.status) : null;
  const trip = reservation?.trip;
  const payment = reservation?.payment;
  const routeLabel = trip ? `${trip.line.startCity} → ${trip.line.endCity}` : "";
  const duration =
    trip?.departureTime && trip.arrivalTime
      ? formatTripDuration(trip.departureTime, trip.arrivalTime)
      : null;

  return (
    <div
      style={{
        paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <header className="mb-5 flex items-center gap-3">
        <Link
          to={ROUTES.bookings}
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Retour aux réservations"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Détail de la réservation</h1>
      </header>

      {!reservationId ? <ErrorState message={USER_MESSAGES.reservationIdMissing} /> : null}

      {reservationId && reservationQuery.isPending && !reservationQuery.error ? (
        <BookingDetailSkeleton />
      ) : null}

      {reservationId && reservationQuery.isError ? (
        <div className="space-y-4">
          <ErrorState
            message={errorMessage}
            onRetry={isNotFound ? undefined : () => void reservationQuery.refetch()}
          />
          <Link
            to={ROUTES.bookings}
            className="inline-flex min-h-touch items-center text-sm font-medium text-primary"
          >
            ← Retour à mes réservations
          </Link>
        </div>
      ) : null}

      {reservation && trip && statusView ? (
        <div className={passengerTwoColumnClass}>
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <div className="mt-1">
                    <Badge variant={statusView.badgeVariant}>{statusView.label}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Référence</p>
                  <p className="mt-1 font-mono text-sm text-foreground">
                    {reservation.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </Card>

            <StatusMessage status={reservation.status} />

            <Card className="p-4">
              <h2 className="text-sm font-medium text-foreground">Trajet</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Ligne</dt>
                  <dd className="font-medium text-foreground">{routeLabel}</dd>
                  <dd className="text-xs text-muted-foreground">{trip.line.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Date de départ</dt>
                  <dd className="font-medium text-foreground">
                    {formatDayLabel(trip.departureTime)}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-muted-foreground">Heure de départ</dt>
                    <dd className="text-lg font-semibold text-foreground">
                      {formatTime(trip.departureTime)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Heure d&apos;arrivée</dt>
                    <dd className="text-lg font-semibold text-foreground">
                      {trip.arrivalTime ? formatTime(trip.arrivalTime) : "—"}
                    </dd>
                  </div>
                </div>
                {duration ? (
                  <div>
                    <dt className="text-muted-foreground">Durée estimée</dt>
                    <dd className="font-medium text-foreground">{duration}</dd>
                  </div>
                ) : null}
              </dl>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-sm font-medium text-foreground">Paiement</h2>
              {payment ? (
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Montant</dt>
                    <dd className="text-lg font-semibold text-primary">
                      {formatPaymentAmount(payment.amount, payment.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Statut</dt>
                    <dd className="font-medium text-foreground">
                      {getPaymentStatusLabel(payment.status)}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Date du paiement</dt>
                    <dd className="font-medium text-foreground">
                      {formatDate(payment.createdAt)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Aucun paiement associé.</p>
              )}
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-medium text-foreground">Réservation</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Créée le</dt>
                  <dd className="font-medium text-foreground">
                    {formatDate(reservation.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Dernière mise à jour</dt>
                  <dd className="font-medium text-foreground">
                    {formatDate(reservation.updatedAt)}
                  </dd>
                </div>
              </dl>
            </Card>

            <div className="space-y-3 pt-2">
              {reservation.status === "CONFIRMED" ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(ROUTES.boardingPass(reservation.id))}
                >
                  Afficher le QR d&apos;embarquement
                </Button>
              ) : null}

              <Link
                to={ROUTES.trips}
                className="flex min-h-touch items-center justify-center text-sm font-medium text-primary"
              >
                Voir les trajets disponibles
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
