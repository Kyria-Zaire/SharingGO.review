import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/http";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePendingReservation } from "@/hooks/useCreatePendingReservation";
import { ReservationEntryFooter } from "@/features/trips/components/ReservationEntryFooter";
import { TripDetailHero } from "@/features/trips/components/TripDetailHero";
import { TripDetailSkeleton } from "@/features/trips/components/TripDetailSkeleton";
import { TripKnowBeforeYouGo } from "@/features/trips/components/TripKnowBeforeYouGo";
import { TripPriceCard } from "@/features/trips/components/TripPriceCard";
import { TripScheduleCard } from "@/features/trips/components/TripScheduleCard";
import { TripSeatsCard } from "@/features/trips/components/TripSeatsCard";
import { usePublicTrip } from "@/hooks/usePublicTrip";
import { useTripIdParam } from "@/hooks/useTripIdParam";
import { deriveTripDetailReservationCta } from "@/lib/trip-availability";
import { ROUTES } from "@/types/routes";
import { ChevronLeft } from "lucide-react";

export function TripDetailPage() {
  const tripId = useTripIdParam();
  const tripQuery = usePublicTrip(tripId);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { createPending, isPending, errorMessage, reset } = useCreatePendingReservation();

  const isNotFound =
    tripQuery.error instanceof ApiError && tripQuery.error.code === "TRIP_NOT_FOUND";

  const errorMessageTrip = isNotFound
    ? "Trajet introuvable"
    : tripQuery.error instanceof ApiError
      ? tripQuery.error.message
      : tripQuery.error instanceof Error
        ? tripQuery.error.message
        : "Impossible de charger ce trajet";

  const showSkeleton = tripQuery.isPending && !tripQuery.data;

  const handleReserveClick = () => {
    if (!tripQuery.data || !tripId || authLoading || isPending) return;

    const cta = deriveTripDetailReservationCta(tripQuery.data);
    if (cta.disabled) return;

    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location.pathname } });
      return;
    }

    reset();
    createPending(tripId);
  };

  return (
    <div
      style={{
        paddingBottom: "calc(7rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <header className="mb-5 flex items-center gap-3">
        <Link
          to={ROUTES.trips}
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Retour aux trajets"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Détails du trajet</h1>
      </header>

      {showSkeleton ? <TripDetailSkeleton /> : null}

      {!tripId ? <ErrorState message="Identifiant de trajet manquant" /> : null}

      {tripId && tripQuery.isError ? (
        <div className="space-y-4">
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
      ) : null}

      {tripQuery.data ? (
        <>
          <TripDetailHero trip={tripQuery.data} />
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            <TripScheduleCard trip={tripQuery.data} />
            <TripSeatsCard trip={tripQuery.data} />
            <TripPriceCard />
            <TripKnowBeforeYouGo />
          </div>

          <ReservationEntryFooter
            cta={deriveTripDetailReservationCta(tripQuery.data)}
            errorMessage={errorMessage}
            isLoading={isPending}
            onReserveClick={handleReserveClick}
          />
        </>
      ) : null}
    </div>
  );
}
