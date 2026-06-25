import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { TripDetailHeroSection } from "./TripDetailHeroSection";
import { TripDetailKnowBeforeSection } from "./TripDetailKnowBeforeSection";
import { TripDetailReservationCard } from "./TripDetailReservationCard";
import { TripDetailReassuranceBand } from "./TripDetailReassuranceBand";
import { TripDetailShuttleSection } from "./TripDetailShuttleSection";
import { TripDetailSpecsSection } from "./TripDetailSpecsSection";
import { TripDetailTimeline } from "./TripDetailTimeline";
import type { TripDetailReservationCta } from "@/lib/trip-availability";
import type { PublicTrip } from "@/types/trips.types";

export interface TripDetailViewProps {
  trip: PublicTrip;
  cta: TripDetailReservationCta;
  errorMessage?: string | null;
  isLoading?: boolean;
  onReserveClick: () => void;
}

export function TripDetailView({
  trip,
  cta,
  errorMessage,
  isLoading,
  onReserveClick,
}: TripDetailViewProps) {
  const reservationCard = (
    <TripDetailReservationCard
      trip={trip}
      cta={cta}
      errorMessage={errorMessage}
      isLoading={isLoading}
      onReserveClick={onReserveClick}
    />
  );

  return (
    <div className="w-full">
      <TripDetailHeroSection
        trip={trip}
        cta={cta}
        errorMessage={errorMessage}
        isLoading={isLoading}
        onReserveClick={onReserveClick}
      />

      <div className={landingContainerClass}>
        <div className="space-y-5 py-6 lg:space-y-6">
          <TripDetailTimeline trip={trip} />

          <div className="lg:hidden">{reservationCard}</div>

          <div className="md:grid md:grid-cols-2 md:items-stretch md:gap-5 lg:gap-6">
            <TripDetailSpecsSection />
            <TripDetailKnowBeforeSection />
          </div>
          <TripDetailShuttleSection />
        </div>
      </div>

      <TripDetailReassuranceBand />
    </div>
  );
}
