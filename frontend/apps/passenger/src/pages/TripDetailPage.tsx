import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/http";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import { ErrorState } from "@/components/ui/ErrorState";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { TripDetailSkeleton } from "@/features/trips/components/trip-detail/TripDetailSkeleton";
import { TripDetailView } from "@/features/trips/components/trip-detail/TripDetailView";
import { useAuth } from "@/hooks/useAuth";
import { usePublicTrip } from "@/hooks/usePublicTrip";
import { useTripIdParam } from "@/hooks/useTripIdParam";
import { deriveTripDetailReservationCta } from "@/lib/trip-availability";
import { isDemoTripId, isUiDemoTripsEnabled } from "@/lib/ui-demo-trips";
import { ROUTES } from "@/types/routes";

export function TripDetailPage() {
  const tripId = useTripIdParam();
  const tripQuery = usePublicTrip(tripId);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isNotFound =
    tripQuery.error instanceof ApiError && tripQuery.error.code === "TRIP_NOT_FOUND";

  const errorMessageTrip = isNotFound
    ? USER_MESSAGES.tripNotFound
    : formatUserFacingError(tripQuery.error, USER_MESSAGES.tripLoad);

  const showSkeleton = tripQuery.isPending && !tripQuery.data;

  const handleReserveClick = () => {
    if (!tripQuery.data || !tripId || authLoading) return;

    const cta = deriveTripDetailReservationCta(tripQuery.data);
    if (cta.disabled) return;

    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: ROUTES.tripBooking(tripId) } });
      return;
    }

    navigate(ROUTES.tripBooking(tripId));
  };

  if (showSkeleton) {
    return <TripDetailSkeleton />;
  }

  if (!tripId) {
    return (
      <div className={landingContainerClass}>
        <ErrorState message={USER_MESSAGES.tripIdMissing} />
      </div>
    );
  }

  if (tripQuery.isError) {
    return (
      <div className={landingContainerClass}>
        <div className="space-y-4 py-8">
          <ErrorState
            message={errorMessageTrip}
            onRetry={isNotFound ? undefined : () => void tripQuery.refetch()}
          />
          <Link
            to={ROUTES.trips}
            className="inline-flex min-h-touch items-center text-sm font-medium text-primary"
          >
            ← Retour aux trajets
          </Link>
        </div>
      </div>
    );
  }

  if (!tripQuery.data) {
    return null;
  }

  const isDemoTrip = isUiDemoTripsEnabled() && isDemoTripId(tripQuery.data.id);
  const cta = isDemoTrip
    ? { label: "Trajet démo UI", disabled: true }
    : deriveTripDetailReservationCta(tripQuery.data);

  return (
    <TripDetailView
      trip={tripQuery.data}
      cta={cta}
      isLoading={false}
      onReserveClick={handleReserveClick}
    />
  );
}
