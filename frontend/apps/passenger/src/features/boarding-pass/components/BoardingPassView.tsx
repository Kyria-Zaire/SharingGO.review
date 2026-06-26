import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BoardingPassHeader } from "@/features/boarding-pass/components/BoardingPassHeader";
import { BoardingPassInfoSection } from "@/features/boarding-pass/components/BoardingPassInfoSection";
import { BoardingPassMainCard } from "@/features/boarding-pass/components/BoardingPassMainCard";
import { BoardingPassSupportSection } from "@/features/boarding-pass/components/BoardingPassSupportSection";
import {
  BoardingPassMobileTripCta,
  BoardingPassTripSummary,
} from "@/features/boarding-pass/components/BoardingPassTripSummary";
import { BoardingPassTrustFooter } from "@/features/boarding-pass/components/BoardingPassTrustFooter";
import { BOARDING_PASS_REFRESH_CTA } from "@/features/boarding-pass/constants/boarding-pass-content";
import { formatBoardingValidDateLabel } from "@/features/boarding-pass/lib/boarding-pass-format";
import {
  resolveBoardingPassBadge,
  resolveBoardingPassReadiness,
} from "@/features/boarding-pass/lib/boarding-pass-status";
import type { PassengerUser } from "@/types/auth";
import type { UserReservationDetail } from "@/types/reservations";

export function BoardingPassView({
  reservation,
  user,
  qrPayload,
  showQr,
  countdownDisplay,
  showCountdown,
  isQrExpired,
  hasBoardingError,
  isRefreshing,
  onRefresh,
}: {
  reservation: UserReservationDetail;
  user: PassengerUser | null;
  qrPayload: string | null;
  showQr: boolean;
  countdownDisplay: string;
  showCountdown: boolean;
  isQrExpired: boolean;
  hasBoardingError: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  const { trip } = reservation;
  const isPastTrip = new Date(trip.departureTime).getTime() < Date.now();

  const badge = resolveBoardingPassBadge(reservation.status, {
    isPastTrip,
    isQrExpired,
    hasBoardingError,
  });

  const readiness = resolveBoardingPassReadiness(
    badge,
    formatBoardingValidDateLabel(trip.departureTime)
  );

  return (
    <div className="space-y-4 pb-8 sm:space-y-5 lg:space-y-6 lg:pb-12">
      <BoardingPassHeader reservationId={reservation.id} badge={badge} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <BoardingPassMainCard
            reservationId={reservation.id}
            user={user}
            readiness={readiness}
            qrPayload={qrPayload}
            showQr={showQr}
            countdownDisplay={countdownDisplay}
            showCountdown={showCountdown}
          />

          <BoardingPassMobileTripCta tripId={trip.id} />

          <div className="lg:hidden">
            <BoardingPassTripSummary trip={trip} className="mt-0" showCta={false} />
          </div>

          <BoardingPassInfoSection />
          <BoardingPassSupportSection />

          {showQr ? (
            <div className="flex justify-center lg:justify-start">
              <Button
                variant="secondary"
                size="md"
                onClick={onRefresh}
                isLoading={isRefreshing}
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                {BOARDING_PASS_REFRESH_CTA}
              </Button>
            </div>
          ) : null}

          <BoardingPassTrustFooter />
        </div>

        <div className="hidden lg:block">
          <BoardingPassTripSummary trip={trip} className="lg:sticky lg:top-24" showCta />
        </div>
      </div>
    </div>
  );
}
