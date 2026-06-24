import { useState } from "react";
import { cn } from "@/lib/cn";
import { TRIPS_HERO_CONTENT } from "@/features/trips/constants/trips-content";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";
import { HeroBackgroundMedia } from "@/features/home/components/HeroBackgroundMedia";
import {
  heroContentShellClass,
  heroSubtitleClass,
  heroTextBackdropClass,
  heroTitleClass,
} from "@/features/home/lib/hero-visual";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { TripsSearchBar } from "./TripsSearchBar";
import type { TripDirectionFilter } from "@/features/trips/lib/trips-filters";

export interface TripsHeroSectionProps {
  direction: TripDirectionFilter;
  dateKey: string;
  onDirectionChange: (direction: TripDirectionFilter) => void;
  onDateChange: (dateKey: string) => void;
  onSwapDirection: () => void;
  onSearch: () => void;
}

export function TripsHeroSection({
  direction,
  dateKey,
  onDirectionChange,
  onDateChange,
  onSwapDirection,
  onSearch,
}: TripsHeroSectionProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section
      className="relative scroll-mt-20 overflow-hidden"
      aria-labelledby="trips-hero-title"
    >
      <HeroBackgroundMedia
        imageSrc={LANDING_ASSETS.heroVan}
        photoFailed={photoFailed}
        onPhotoError={() => setPhotoFailed(true)}
      />

      <div className={cn(landingContainerClass, "relative z-10")}>
        <div className={heroContentShellClass}>
          <div className={heroTextBackdropClass} aria-hidden />

          <div className="relative">
            <h1 id="trips-hero-title" className={heroTitleClass}>
              {TRIPS_HERO_CONTENT.titleBefore}
              <span className="text-primary">{TRIPS_HERO_CONTENT.titleHighlight}</span>
            </h1>

            <p className={heroSubtitleClass}>
              {TRIPS_HERO_CONTENT.subtitleBefore}
              <strong className="font-semibold text-foreground">
                {TRIPS_HERO_CONTENT.subtitleBold}
              </strong>
              {TRIPS_HERO_CONTENT.subtitleAfter}
            </p>
          </div>
        </div>
      </div>

      <div className={cn(landingContainerClass, "relative z-20 -mt-12 sm:-mt-16 lg:-mt-20")}>
        <TripsSearchBar
          direction={direction}
          dateKey={dateKey}
          onDirectionChange={onDirectionChange}
          onDateChange={onDateChange}
          onSwapDirection={onSwapDirection}
          onSearch={onSearch}
        />
      </div>
    </section>
  );
}
