import { useState } from "react";
import { cn } from "@/lib/cn";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";
import { HeroBackgroundMedia } from "@/features/home/components/HeroBackgroundMedia";
import { SUBSCRIPTIONS_HERO_CONTENT } from "@/features/subscriptions/constants/subscriptions-content";
import {
  heroTextBackdropClass,
  heroTitleClass,
} from "@/features/home/lib/hero-visual";
import { landingContainerClass } from "@/features/home/lib/landing-layout";

const heroShellClass =
  "relative max-w-xl py-12 sm:py-14 lg:min-h-[19rem] lg:py-12 lg:pr-8";

const heroSubtitleClass =
  "mt-4 max-w-lg text-base leading-relaxed text-foreground/95 [text-shadow:0_1px_16px_rgba(0,0,0,0.45)] sm:text-[1.05rem] lg:mt-4";

export function SubscriptionsHeroSection() {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section
      className="relative scroll-mt-20 overflow-hidden border-b border-white/[0.06]"
      aria-labelledby="subscriptions-hero-title"
    >
      <HeroBackgroundMedia
        imageSrc={LANDING_ASSETS.subscriptionInterior}
        photoFailed={photoFailed}
        onPhotoError={() => setPhotoFailed(true)}
      />

      <div className={cn(landingContainerClass, "relative z-10")}>
        <div className={cn(heroShellClass, "max-lg:pb-14")}>
          <div className={heroTextBackdropClass} aria-hidden />

          <div className="relative">
            <h1 id="subscriptions-hero-title" className={heroTitleClass}>
              {SUBSCRIPTIONS_HERO_CONTENT.titleBefore}
              <span className="text-primary">{SUBSCRIPTIONS_HERO_CONTENT.titleHighlight}</span>
            </h1>

            <p className={heroSubtitleClass}>{SUBSCRIPTIONS_HERO_CONTENT.subtitle}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
