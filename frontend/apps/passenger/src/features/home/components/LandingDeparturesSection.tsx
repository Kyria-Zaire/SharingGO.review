import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/cn";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import { deriveTripAvailability } from "@/lib/trip-availability";
import { todayParisDateKey } from "@/lib/format-date";
import { usePublicTrips } from "@/hooks/usePublicTrips";
import { ROUTES } from "@/types/routes";
import { LANDING_SECTION_IDS } from "@/features/home/constants/landing-content";
import {
  landingContainerClass,
  landingOutlineButtonClass,
  landingPrimaryButtonClass,
  landingSectionClass,
} from "@/features/home/lib/landing-layout";
import { LandingDepartureCard } from "./LandingDepartureCard";

function DeparturesSkeleton({ count }: { count: number }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        count === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
      )}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-52 animate-pulse rounded-2xl border border-border/60 bg-muted/20"
        />
      ))}
    </div>
  );
}

export function LandingDeparturesSection() {
  const dateFilter = { preset: "today" as const, dateKey: todayParisDateKey() };
  const tripsQuery = usePublicTrips(dateFilter);
  const trips = (tripsQuery.data?.trips ?? [])
    .filter((trip) => deriveTripAvailability(trip).status !== "past")
    .slice(0, 4);
  const mobileTrips = trips.slice(0, 2);
  const errorMessage = formatUserFacingError(tripsQuery.error, USER_MESSAGES.tripsLoad);

  return (
    <section
      id={LANDING_SECTION_IDS.departures}
      className={cn(landingSectionClass, "border-t border-border/40")}
      aria-labelledby="landing-departures-title"
    >
      <div className={landingContainerClass}>
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="landing-departures-title" className="text-xl font-bold text-foreground sm:text-2xl">
            Prochains départs
          </h2>
          <Link
            to={ROUTES.trips}
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/90 sm:inline-flex"
          >
            Voir tous les trajets
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            to={ROUTES.trips}
            className="text-sm font-medium text-primary sm:hidden"
          >
            Voir tout
          </Link>
        </div>

        {tripsQuery.isLoading ? (
          <>
            <div className="hidden lg:block">
              <DeparturesSkeleton count={4} />
            </div>
            <div className="lg:hidden">
              <DeparturesSkeleton count={2} />
            </div>
          </>
        ) : null}

        {tripsQuery.isError ? (
          <ErrorState message={errorMessage} onRetry={() => void tripsQuery.refetch()} />
        ) : null}

        {!tripsQuery.isLoading && !tripsQuery.isError && trips.length === 0 ? (
          <div className="rounded-2xl border border-border/80 bg-muted/20 px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun départ prévu aujourd&apos;hui. Consultez le planning complet.
            </p>
            <Link to={ROUTES.trips} className={cn(landingPrimaryButtonClass, "mt-5 inline-flex")}>
              Voir tous les trajets
            </Link>
          </div>
        ) : null}

        {!tripsQuery.isLoading && !tripsQuery.isError && trips.length > 0 ? (
          <>
            <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
              {trips.map((trip) => (
                <LandingDepartureCard key={trip.id} trip={trip} variant="desktop" />
              ))}
            </div>

            <div className="space-y-3 lg:hidden">
              {mobileTrips.map((trip) => (
                <LandingDepartureCard key={trip.id} trip={trip} variant="mobile" />
              ))}
              <Link
                to={ROUTES.trips}
                className={cn(landingOutlineButtonClass, "mt-2 w-full")}
              >
                Voir tous les trajets
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
