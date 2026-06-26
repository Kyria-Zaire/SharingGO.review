import { useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "@/api/http";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import {
  BoardingPassErrorCard,
} from "@/features/boarding-pass/components/BoardingPassErrorCard";
import { getBoardingErrorView } from "@/features/boarding-pass/lib/boarding-pass-errors";
import { BoardingPassSkeleton } from "@/features/boarding-pass/components/BoardingPassSkeleton";
import { BoardingPassView } from "@/features/boarding-pass/components/BoardingPassView";
import { useAuth } from "@/hooks/useAuth";
import { useBoardingCountdown } from "@/hooks/useBoardingCountdown";
import { useBoardingQr } from "@/hooks/useBoardingQr";
import { useUserReservation } from "@/hooks/useUserReservation";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import type { BoardingApiErrorCode } from "@/types/boarding";
import { ROUTES } from "@/types/routes";
import { RefreshCw } from "lucide-react";

export function BoardingPassPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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
  const detailPath = reservationId ? ROUTES.bookingDetail(reservationId) : ROUTES.bookings;

  const apiExpired = boardingError?.code === "BOARDING_EXPIRED";
  const isLocallyExpired = Boolean(boardingData) && countdown.isExpired;
  const showQr =
    Boolean(boardingData?.qr.payload) && !apiExpired && !isLocallyExpired;

  const errorView =
    boardingError && !isUnauthorized
      ? getBoardingErrorView(boardingError.code as BoardingApiErrorCode, detailPath)
      : null;

  const isLoading = boardingQuery.isPending && !boardingError && !reservationQuery.data;
  const isReservationLoading = reservationQuery.isPending && !reservation;

  const handleRefresh = () => {
    void boardingQuery.refetch();
  };

  if (!reservationId) {
    return (
      <div className={landingContainerClass}>
        <ErrorState message={USER_MESSAGES.reservationIdMissing} />
      </div>
    );
  }

  if (isUnauthorized) {
    return null;
  }

  if (isLoading || isReservationLoading) {
    return (
      <div className={landingContainerClass}>
        <BoardingPassSkeleton />
      </div>
    );
  }

  if (errorView) {
    return (
      <div className={landingContainerClass}>
        <div className="space-y-4">
          <BoardingPassErrorCard {...errorView} />
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
      </div>
    );
  }

  if (boardingQuery.isError && boardingError && !errorView) {
    return (
      <div className={landingContainerClass}>
        <ErrorState
          message={formatUserFacingError(boardingError, USER_MESSAGES.boardingLoad)}
          onRetry={() => void boardingQuery.refetch()}
        />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className={landingContainerClass}>
        <div className="space-y-4">
          <ErrorState message={USER_MESSAGES.reservationNotFound} />
          <Link
            to={ROUTES.bookings}
            className="inline-flex min-h-touch items-center text-sm font-medium text-primary"
          >
            ← Retour à mes réservations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={landingContainerClass}>
      <BoardingPassView
        reservation={reservation}
        user={user}
        qrPayload={boardingData?.qr.payload ?? null}
        showQr={showQr}
        countdownDisplay={countdown.display}
        showCountdown={Boolean(boardingData?.expiresAt) && showQr}
        isQrExpired={apiExpired || isLocallyExpired}
        hasBoardingError={Boolean(errorView)}
        isRefreshing={boardingQuery.isFetching}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
