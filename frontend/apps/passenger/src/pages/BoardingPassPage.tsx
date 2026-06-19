import { ChevronLeft, QrCode, RefreshCw, TimerOff } from "lucide-react";
import { useEffect } from "react";
import QRCode from "react-qr-code";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "@/api/http";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { useBoardingCountdown } from "@/hooks/useBoardingCountdown";
import { useBoardingQr } from "@/hooks/useBoardingQr";
import { useUserReservation } from "@/hooks/useUserReservation";
import { passengerTwoColumnClass } from "@/lib/passenger-layout";
import { formatDayLabel, formatTime } from "@/lib/format-date";
import type { BoardingApiErrorCode } from "@/types/boarding";
import { ROUTES } from "@/types/routes";

function BoardingPassSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
      <div className="mx-auto h-64 max-w-[280px] animate-pulse rounded-xl bg-muted" />
      <div className="h-12 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

function BoardingErrorCard({
  title,
  message,
  backLabel,
  backTo,
}: {
  title: string;
  message: string;
  backLabel: string;
  backTo: string;
}) {
  return (
    <Card className="space-y-4 p-5 text-center">
      <TimerOff className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
      <div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
      <Link
        to={backTo}
        className="inline-flex min-h-touch items-center justify-center text-sm font-medium text-primary"
      >
        {backLabel}
      </Link>
    </Card>
  );
}

function getBoardingErrorView(code: BoardingApiErrorCode | string): {
  title: string;
  message: string;
  backLabel: string;
  backTo: string;
} | null {
  switch (code) {
    case "RESERVATION_NOT_FOUND":
      return {
        title: "Billet introuvable",
        message: "Cette réservation n'existe pas ou ne vous appartient pas.",
        backLabel: "← Retour à mes réservations",
        backTo: ROUTES.bookings,
      };
    case "RESERVATION_NOT_CONFIRMED":
      return {
        title: "Billet non confirmé",
        message: "Ce billet n'est pas confirmé et ne peut pas être présenté.",
        backLabel: "← Retour au détail",
        backTo: "",
      };
    case "BOARDING_NOT_AVAILABLE":
      return {
        title: "Billet pas encore disponible",
        message: "Le QR d'embarquement sera disponible une fois le paiement validé.",
        backLabel: "← Retour au détail",
        backTo: "",
      };
    case "BOARDING_EXPIRED":
      return {
        title: "Billet expiré",
        message: "La fenêtre d'embarquement est terminée (départ + 10 minutes).",
        backLabel: "← Retour au détail",
        backTo: "",
      };
    default:
      return null;
  }
}

export function BoardingPassPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const boardingQuery = useBoardingQr(reservationId);
  const reservationQuery = useUserReservation(reservationId);

  const boardingData = boardingQuery.data;
  const countdown = useBoardingCountdown(boardingData?.expiresAt);

  const boardingError =
    boardingQuery.error instanceof ApiError ? boardingQuery.error : null;

  const isUnauthorized =
    boardingError?.status === 401 || boardingError?.code === "UNAUTHORIZED";

  useEffect(() => {
    if (isUnauthorized) {
      navigate(ROUTES.login, { replace: true, state: { from: location.pathname } });
    }
  }, [isUnauthorized, navigate, location.pathname]);

  const reservation = reservationQuery.data;
  const trip = reservation?.trip;
  const routeLabel = trip ? `${trip.line.startCity} → ${trip.line.endCity}` : "";

  const detailPath = reservationId ? ROUTES.bookingDetail(reservationId) : ROUTES.bookings;

  const apiExpired = boardingError?.code === "BOARDING_EXPIRED";
  const isLocallyExpired = Boolean(boardingData) && countdown.isExpired;
  const showQr = Boolean(boardingData?.qr.payload) && !apiExpired && !isLocallyExpired;

  const errorView =
    boardingError && !isUnauthorized
      ? getBoardingErrorView(boardingError.code as BoardingApiErrorCode)
      : null;

  const resolvedErrorView =
    errorView && errorView.backTo === "" && reservationId
      ? { ...errorView, backTo: detailPath }
      : errorView;

  const handleRefresh = () => {
    void boardingQuery.refetch();
  };

  if (!reservationId) {
    return <ErrorState message="Identifiant de réservation manquant" />;
  }

  if (isUnauthorized) {
    return null;
  }

  return (
    <div
      style={{
        paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <header className="mb-5 flex items-center gap-3">
        <Link
          to={detailPath}
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Retour au détail du billet"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Mon billet</h1>
      </header>

      {boardingQuery.isPending && !boardingError ? <BoardingPassSkeleton /> : null}

      {boardingQuery.isError && boardingError && !resolvedErrorView && !isUnauthorized ? (
        <ErrorState
          message={boardingError.message}
          onRetry={() => void boardingQuery.refetch()}
        />
      ) : null}

      {resolvedErrorView ? (
        <div className="space-y-4">
          <BoardingErrorCard {...resolvedErrorView} />
          {boardingError?.code === "BOARDING_EXPIRED" ? (
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleRefresh}
              isLoading={boardingQuery.isFetching}
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Actualiser
            </Button>
          ) : null}
        </div>
      ) : null}

      {boardingData && !resolvedErrorView ? (
        <div className={passengerTwoColumnClass}>
          {trip ? (
            <Card className="p-4">
              <h2 className="text-sm font-medium text-foreground">Trajet</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Ligne</dt>
                  <dd className="font-medium text-foreground">{routeLabel}</dd>
                  <dd className="text-xs text-muted-foreground">{trip.line.name}</dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="font-medium text-foreground">
                      {formatDayLabel(trip.departureTime)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Départ</dt>
                    <dd className="text-lg font-semibold text-foreground">
                      {formatTime(trip.departureTime)}
                    </dd>
                  </div>
                </div>
              </dl>
            </Card>
          ) : (
            <div className="hidden lg:block" aria-hidden />
          )}

          <div className="space-y-4 lg:sticky lg:top-[calc(3.5rem+1.25rem)]">
            {showQr ? (
              <Card className="overflow-hidden p-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                    <QRCode
                      value={boardingData.qr.payload}
                      size={256}
                      level="M"
                      aria-label="QR code d'embarquement"
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox="0 0 256 256"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-center">
                    <QrCode className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <p className="text-sm font-medium text-foreground">
                      Présente ce QR au chauffeur
                    </p>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Valide encore{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {countdown.display}
                    </span>
                  </p>
                </div>
              </Card>
            ) : (
              <BoardingErrorCard
                title="Billet expiré"
                message="La validité du QR est terminée. Actualisez pour vérifier auprès du serveur."
                backLabel="← Retour au détail"
                backTo={detailPath}
              />
            )}

            <div className="space-y-3 pt-1">
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={handleRefresh}
                isLoading={boardingQuery.isFetching}
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Actualiser le QR
              </Button>
              <Link
                to={detailPath}
                className="flex min-h-touch items-center justify-center text-sm font-medium text-primary"
              >
                Retour au détail du billet
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
