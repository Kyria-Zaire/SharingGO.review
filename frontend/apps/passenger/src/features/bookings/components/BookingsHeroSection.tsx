import { useState } from "react";
import { cn } from "@/lib/cn";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";
import { HeroBackgroundMedia } from "@/features/home/components/HeroBackgroundMedia";
import { BOOKINGS_HERO_CONTENT } from "@/features/bookings/constants/bookings-content";
import {
  heroTextBackdropClass,
  heroTitleClass,
} from "@/features/home/lib/hero-visual";
import { landingContainerClass } from "@/features/home/lib/landing-layout";

/** Hero bookings — plus compact desktop pour remonter la liste sous la ligne de flottaison. */
const bookingsHeroShellClass =
  "relative max-w-xl py-12 sm:py-14 lg:min-h-[19rem] lg:py-12 lg:pr-8";

const bookingsHeroSubtitleClass =
  "mt-4 max-w-lg text-base leading-relaxed text-foreground/95 [text-shadow:0_1px_16px_rgba(0,0,0,0.45)] sm:text-[1.05rem] lg:mt-4";

export function BookingsHeroSection() {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section
      className="relative scroll-mt-20 overflow-hidden border-b border-white/[0.06]"
      aria-labelledby="bookings-hero-title"
    >
      <HeroBackgroundMedia
        imageSrc={LANDING_ASSETS.heroVan}
        photoFailed={photoFailed}
        onPhotoError={() => setPhotoFailed(true)}
      />

      <div className={cn(landingContainerClass, "relative z-10")}>
        <div className={cn(bookingsHeroShellClass, "max-lg:pb-14")}>
          <div className={heroTextBackdropClass} aria-hidden />

          <div className="relative">
            <h1 id="bookings-hero-title" className={heroTitleClass}>
              {BOOKINGS_HERO_CONTENT.titleBefore}
              <span className="text-primary">{BOOKINGS_HERO_CONTENT.titleHighlight}</span>
            </h1>

            <p className={bookingsHeroSubtitleClass}>
              {BOOKINGS_HERO_CONTENT.subtitleBefore}
              <strong className="font-semibold text-foreground">
                {BOOKINGS_HERO_CONTENT.subtitleBold}
              </strong>
              {BOOKINGS_HERO_CONTENT.subtitleAfter}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
