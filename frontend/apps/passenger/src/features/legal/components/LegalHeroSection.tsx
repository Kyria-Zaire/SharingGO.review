import { useState } from "react";
import { cn } from "@/lib/cn";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";
import { HeroBackgroundMedia } from "@/features/home/components/HeroBackgroundMedia";
import {
  heroTextBackdropClass,
  heroTitleClass,
} from "@/features/home/lib/hero-visual";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import type { LegalHeroContent } from "@/features/legal/types/legal-document";

const heroShellClass =
  "relative max-w-2xl py-12 sm:py-14 lg:min-h-[16rem] lg:py-12 lg:pr-8";

const heroSubtitleClass =
  "mt-4 max-w-xl text-base leading-relaxed text-foreground/95 [text-shadow:0_1px_16px_rgba(0,0,0,0.45)] sm:text-[1.05rem]";

const heroMetaClass =
  "mt-3 text-sm text-foreground/80 [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]";

export function LegalHeroSection({ hero }: { hero: LegalHeroContent }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section
      className="relative scroll-mt-20 overflow-hidden border-b border-white/[0.06]"
      aria-labelledby="legal-hero-title"
    >
      <HeroBackgroundMedia
        imageSrc={LANDING_ASSETS.heroVan}
        photoFailed={photoFailed}
        onPhotoError={() => setPhotoFailed(true)}
      />

      <div className={cn(landingContainerClass, "relative z-10")}>
        <div className={cn(heroShellClass, "max-lg:pb-14")}>
          <div className={heroTextBackdropClass} aria-hidden />

          <div className="relative">
            <p className={heroMetaClass}>
              {hero.lastUpdatedLabel} :{" "}
              <time dateTime={hero.lastUpdatedIso}>{hero.lastUpdatedDate}</time>
            </p>

            <h1 id="legal-hero-title" className={cn(heroTitleClass, "mt-2")}>
              <span className="text-primary">{hero.title}</span>
            </h1>

            <p className={heroSubtitleClass}>{hero.intro}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
