import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldCheck, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/types/routes";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";
import { HeroBackgroundMedia } from "@/features/home/components/HeroBackgroundMedia";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { TripAvailabilityBadge } from "@/features/trips/components/TripAvailabilityBadge";
import { TripDetailReservationCard } from "@/features/trips/components/trip-detail/TripDetailReservationCard";
import {
  TRIP_DETAIL_BADGES,
  TRIP_DETAIL_HERO_TRUST,
} from "@/features/trips/constants/trip-detail-content";
import { formatTripRouteFull } from "@/lib/trip-city-labels";
import { deriveTripAvailability, type TripDetailReservationCta } from "@/lib/trip-availability";
import { formatDayLabel } from "@/lib/format-date";
import type { PublicTrip } from "@/types/trips.types";

export interface TripDetailHeroSectionProps {
  trip: PublicTrip;
  cta: TripDetailReservationCta;
  errorMessage?: string | null;
  isLoading?: boolean;
  onReserveClick: () => void;
}

const TRUST_ICONS = {
  payment: Wallet,
  confirm: CheckCircle2,
  seats: ShieldCheck,
} as const;

export function TripDetailHeroSection({
  trip,
  cta,
  errorMessage,
  isLoading,
  onReserveClick,
}: TripDetailHeroSectionProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const availability = deriveTripAvailability(trip);
  const routeLabel = formatTripRouteFull(trip.line.startCity, trip.line.endCity);

  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]" aria-labelledby="trip-detail-hero-title">
      <HeroBackgroundMedia
        imageSrc={LANDING_ASSETS.heroVan}
        photoFailed={photoFailed}
        onPhotoError={() => setPhotoFailed(true)}
      />

      <div className={cn(landingContainerClass, "relative z-10")}>
        <div className="py-6 sm:py-8 lg:py-10">
          <Link
            to={ROUTES.trips}
            className="mb-5 inline-flex min-h-touch items-center gap-2 rounded-lg border border-white/15 bg-black/35 px-3 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:border-white/25 hover:bg-black/50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour aux trajets
          </Link>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
            <div className="relative max-w-xl">
              <div
                className="pointer-events-none absolute -inset-x-4 -inset-y-4 rounded-3xl bg-gradient-to-r from-black/65 via-black/40 to-transparent sm:-inset-x-6"
                aria-hidden
              />

              <div className="relative">
                <div className="mb-4 flex flex-wrap gap-2">
                  <TripAvailabilityBadge
                    label={availability.label}
                    status={availability.status}
                  />
                  <span className="inline-flex rounded-md border border-primary/30 bg-primary/15 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary">
                    {TRIP_DETAIL_BADGES.professional}
                  </span>
                </div>

                <h1
                  id="trip-detail-hero-title"
                  className="text-[1.65rem] font-bold leading-[1.1] tracking-tight text-foreground [text-shadow:0_2px_20px_rgba(0,0,0,0.55)] sm:text-3xl lg:text-4xl"
                >
                  {routeLabel}
                </h1>

                <p className="mt-3 text-base text-foreground/95 [text-shadow:0_1px_14px_rgba(0,0,0,0.45)] sm:text-lg">
                  {formatDayLabel(trip.departureTime)}
                </p>

                <ul className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
                  {TRIP_DETAIL_HERO_TRUST.map((item) => {
                    const Icon = TRUST_ICONS[item.id as keyof typeof TRUST_ICONS];
                    return (
                      <li
                        key={item.id}
                        className="flex items-center gap-2 text-sm text-foreground/85"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                        {item.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <TripDetailReservationCard
              trip={trip}
              cta={cta}
              errorMessage={errorMessage}
              isLoading={isLoading}
              onReserveClick={onReserveClick}
              className="hidden lg:block lg:mx-0 lg:ml-auto lg:max-w-[21rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
