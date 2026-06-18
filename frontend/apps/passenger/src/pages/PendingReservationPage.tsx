import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Lock, TimerOff } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cancelPendingReservation } from "@/api/reservations.api";
import { ApiError } from "@/api/http";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { TICKET_PRICE_LABEL } from "@/constants/pricing";
import { queryKeys } from "@/constants/query-keys";
import { usePendingCountdown } from "@/hooks/usePendingCountdown";
import { usePendingReservation } from "@/hooks/usePendingReservation";
import { usePublicTrip } from "@/hooks/usePublicTrip";
import { formatDayLabel, formatTime } from "@/lib/format-date";
import { ROUTES } from "@/types/routes";

function PendingReservationSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
      <div className="h-12 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export function PendingReservationPage() {
  const { pendingReservationId } = useParams<{ pendingReservationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const pendingQuery = usePendingReservation(pendingReservationId);
  const pending = pendingQuery.data;

  const tripQuery = usePublicTrip(pending?.trip.id);
  const trip = tripQuery.data;

  const expiresAt = pending?.expiresAt;
  const countdown = usePendingCountdown(expiresAt);

  const apiExpired =
    pendingQuery.error instanceof ApiError &&
    (pendingQuery.error.status === 410 || pendingQuery.error.code === "PENDING_EXPIRED");

  const isExpired = Boolean(pending?.isExpired) || countdown.isExpired || apiExpired;

  const cancelMutation = useMutation({
    mutationFn: () => cancelPendingReservation(pendingReservationId!),
    onSuccess: () => {
      if (pendingReservationId) {
        queryClient.removeQueries({
          queryKey: queryKeys.reservations.pending(pendingReservationId),
        });
      }
      navigate(ROUTES.trips, { replace: true });
    },
  });

  const notFoundOrForbidden =
    pendingQuery.error instanceof ApiError &&
    (pendingQuery.error.code === "PENDING_NOT_FOUND" || pendingQuery.error.code === "FORBIDDEN");

  const errorMessage =
    pendingQuery.error instanceof ApiError
      ? pendingQuery.error.code === "PENDING_NOT_FOUND"
        ? "Cette réservation temporaire est introuvable ou déjà finalisée."
        : pendingQuery.error.code === "FORBIDDEN"
          ? "Vous n'avez pas accès à cette réservation."
          : pendingQuery.error.message
      : pendingQuery.error instanceof Error
        ? pendingQuery.error.message
        : "Impossible de charger votre réservation.";

  const handleRelease = () => {
    if (!pendingReservationId || isExpired || cancelMutation.isPending) return;
    cancelMutation.mutate();
  };

  return (
    <div
      style={{
        paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <header className="mb-6 flex items-center gap-3">
        <Link
          to={ROUTES.trips}
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Retour aux trajets"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Place verrouillée</h1>
      </header>

      {!pendingReservationId ? (
        <ErrorState message="Identifiant de réservation manquant" />
      ) : null}

      {pendingReservationId && pendingQuery.isPending && !pendingQuery.error ? (
        <PendingReservationSkeleton />
      ) : null}

      {pendingReservationId && notFoundOrForbidden ? (
        <div className="space-y-4">
          <ErrorState message={errorMessage} />
          <Link
            to={ROUTES.trips}
            className="inline-flex min-h-touch items-center text-sm font-medium text-primary"
          >
            ← Retour aux trajets
          </Link>
        </div>
      ) : null}

      {pendingReservationId && pending && !notFoundOrForbidden ? (
        <div className="space-y-4">
          <Card
            className={
              isExpired
                ? "border-destructive/30 bg-destructive/5 p-6 text-center"
                : "border-primary/30 bg-primary/5 p-6 text-center"
            }
          >
            {isExpired ? (
              <TimerOff className="mx-auto mb-3 h-8 w-8 text-destructive" aria-hidden />
            ) : (
              <Lock className="mx-auto mb-3 h-8 w-8 text-primary" aria-hidden />
            )}

            <p className="text-sm font-medium text-muted-foreground">
              {isExpired ? "Verrouillage expiré" : "Temps restant pour finaliser"}
            </p>

            <p
              className={`mt-2 font-mono text-5xl font-bold tabular-nums tracking-tight ${
                isExpired ? "text-destructive" : "text-primary"
              }`}
              role="timer"
              aria-live="polite"
              aria-atomic="true"
            >
              {isExpired ? "00:00" : countdown.display}
            </p>

            <p className="mt-4 text-sm text-foreground">
              {isExpired
                ? "Le délai de 2 minutes est écoulé. Votre place a été libérée."
                : "Ta place est gardée pendant 2 minutes."}
            </p>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-medium text-foreground">Trajet</h2>
            {trip ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Ligne</dt>
                  <dd className="font-medium text-foreground">
                    {trip.line.startCity} → {trip.line.endCity}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="font-medium text-foreground">
                    {formatDayLabel(trip.departureTime)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Départ</dt>
                  <dd className="font-medium text-foreground">
                    {formatTime(trip.departureTime)}
                  </dd>
                </div>
              </dl>
            ) : (
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Départ</dt>
                  <dd className="font-medium text-foreground">
                    {formatDayLabel(pending.trip.departureTime)} ·{" "}
                    {formatTime(pending.trip.departureTime)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Référence</dt>
                  <dd className="break-all font-mono text-xs text-muted-foreground">
                    {pending.id}
                  </dd>
                </div>
                <div>
                  <Link
                    to={ROUTES.tripDetail(pending.trip.id)}
                    className="inline-flex min-h-touch items-center text-sm font-medium text-primary"
                  >
                    Voir le trajet
                  </Link>
                </div>
              </dl>
            )}
          </Card>

          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Ticket</p>
            <p className="text-lg font-semibold text-primary">{TICKET_PRICE_LABEL}</p>
          </Card>

          <div className="space-y-3 pt-2">
            <Button variant="primary" size="lg" className="w-full" disabled>
              Payer maintenant
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Paiement bientôt disponible
            </p>

            {!isExpired ? (
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                isLoading={cancelMutation.isPending}
                onClick={handleRelease}
              >
                Libérer ma place
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate(ROUTES.trips)}
              >
                Voir les trajets
              </Button>
            )}

            {!isExpired ? (
              <Link
                to={ROUTES.trips}
                className="flex min-h-touch items-center justify-center text-sm font-medium text-primary"
              >
                ← Retour aux trajets
              </Link>
            ) : null}
          </div>

          {cancelMutation.error ? (
            <p className="text-center text-sm text-destructive" role="alert">
              {cancelMutation.error instanceof ApiError
                ? cancelMutation.error.message
                : "Impossible de libérer la place. Réessayez."}
            </p>
          ) : null}
        </div>
      ) : null}

      {pendingReservationId &&
      pendingQuery.isError &&
      !notFoundOrForbidden &&
      !apiExpired &&
      !pending ? (
        <div className="space-y-4">
          <ErrorState
            message={errorMessage}
            onRetry={() => void pendingQuery.refetch()}
          />
          <Link
            to={ROUTES.trips}
            className="inline-flex min-h-touch items-center text-sm font-medium text-primary"
          >
            ← Retour aux trajets
          </Link>
        </div>
      ) : null}

      {pendingReservationId && apiExpired && !pending ? (
        <div className="space-y-4">
          <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
            <TimerOff className="mx-auto mb-3 h-8 w-8 text-destructive" aria-hidden />
            <p className="text-sm font-medium text-muted-foreground">Verrouillage expiré</p>
            <p
              className="mt-2 font-mono text-5xl font-bold tabular-nums text-destructive"
              aria-hidden
            >
              00:00
            </p>
            <p className="mt-4 text-sm text-foreground">
              Le délai de 2 minutes est écoulé. Votre place a été libérée.
            </p>
          </Card>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate(ROUTES.trips)}
          >
            Voir les trajets
          </Button>
        </div>
      ) : null}
    </div>
  );
}
