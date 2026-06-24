import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/cn";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import { ROUTES } from "@/types/routes";
import { LANDING_SECTION_IDS } from "@/features/home/constants/landing-content";
import {
  landingCardClass,
  landingContainerClass,
  landingDepartureCardClass,
  landingDeparturesGridClass,
  landingPrimaryButtonClass,
  landingSectionClass,
} from "@/features/home/lib/landing-layout";
import {
  LANDING_DEPARTURES_LIMIT,
  useLandingUpcomingTrips,
} from "@/hooks/useLandingUpcomingTrips";
import { LandingDepartureCard } from "./LandingDepartureCard";
import type { PublicTrip } from "@/types/trips.types";

function DeparturesSingleTripDesktopLayout({ trip }: { trip: PublicTrip }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,21.5rem)_minmax(0,1fr)] lg:items-stretch lg:gap-5">
      <LandingDepartureCard trip={trip} />

      <aside
        className={cn(
          landingCardClass,
          "hidden flex-col justify-between border-white/[0.1] bg-[#1a1d23] p-8 lg:flex"
        )}
        aria-label="Accès au planning complet"
      >
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-primary">
            Plus d&apos;horaires
          </p>
          <h3 className="mt-2.5 text-xl font-bold tracking-tight text-foreground">
            Planning complet
          </h3>
          <p className="mt-4 max-w-sm text-[0.9375rem] leading-[1.65] text-muted-foreground">
            D&apos;autres horaires sont disponibles sur la ligne Châlons-en-Champagne ↔ Vatry.
            Consultez le planning pour choisir votre créneau.
          </p>
        </div>

        <div className="mt-8 border-t border-white/[0.06] pt-6">
          <Link
            to={ROUTES.trips}
            className={cn(landingPrimaryButtonClass, "inline-flex w-full gap-2 sm:w-auto")}
          >
            Voir tous les trajets
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </aside>
    </div>
  );
}

function DeparturesSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-hidden
    >
      {Array.from({ length: LANDING_DEPARTURES_LIMIT }).map((_, index) => (
        <div
          key={index}
          className={cn(landingDepartureCardClass, "min-h-[11.5rem] animate-pulse")}
        />
      ))}
    </div>
  );
}

export function LandingDeparturesSection() {
  const departuresQuery = useLandingUpcomingTrips(LANDING_DEPARTURES_LIMIT);
  const { trips } = departuresQuery;
  const errorMessage = formatUserFacingError(departuresQuery.error, USER_MESSAGES.tripsLoad);

  return (
    <section
      id={LANDING_SECTION_IDS.departures}
      className={cn(landingSectionClass, "border-t border-white/[0.06]")}
      aria-labelledby="landing-departures-title"
    >
      <div className={landingContainerClass}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 id="landing-departures-title" className="text-xl font-bold text-foreground lg:text-2xl">
            Prochains départs
          </h2>
          <Link
            to={ROUTES.trips}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/90"
          >
            Voir tous les trajets
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {departuresQuery.isLoading ? <DeparturesSkeleton /> : null}

        {departuresQuery.isError ? (
          <ErrorState
            message={errorMessage}
            onRetry={() => void departuresQuery.refetch()}
          />
        ) : null}

        {!departuresQuery.isLoading && !departuresQuery.isError && trips.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#1a1d23] px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun départ à venir. Consultez le planning complet.
            </p>
            <Link to={ROUTES.trips} className={cn(landingPrimaryButtonClass, "mt-5 inline-flex")}>
              Voir tous les trajets
            </Link>
          </div>
        ) : null}

        {!departuresQuery.isLoading && !departuresQuery.isError && trips.length > 0 ? (
          trips.length === 1 ? (
            <DeparturesSingleTripDesktopLayout trip={trips[0]!} />
          ) : (
            <div className={landingDeparturesGridClass(trips.length)}>
              {trips.map((trip) => (
                <LandingDepartureCard key={trip.id} trip={trip} />
              ))}
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}
