import { Link, useParams } from "react-router-dom";
import { ApiError } from "@/api/http";
import { ErrorState } from "@/components/ui/ErrorState";
import { BookingDetailSkeleton } from "@/features/bookings/components/booking-detail/BookingDetailSkeleton";
import { BookingDetailView } from "@/features/bookings/components/booking-detail/BookingDetailView";
import { useUserReservation } from "@/hooks/useUserReservation";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import { ROUTES } from "@/types/routes";

export function BookingDetailPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const reservationQuery = useUserReservation(reservationId);

  const isNotFound =
    reservationQuery.error instanceof ApiError &&
    reservationQuery.error.code === "RESERVATION_NOT_FOUND";

  const errorMessage = isNotFound
    ? USER_MESSAGES.reservationNotFound
    : formatUserFacingError(reservationQuery.error, USER_MESSAGES.reservationLoad);

  const reservation = reservationQuery.data;

  return (
    <div className="w-full">
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

      {reservation ? <BookingDetailView reservation={reservation} /> : null}
    </div>
  );
}
