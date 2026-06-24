import { useState } from "react";
import { ArrowRight, BadgePercent, UserRound, Wallet, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/types/routes";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";
import {
  HERO_CONTENT,
  HERO_TRUST_ITEMS,
  LANDING_SECTION_IDS,
} from "@/features/home/constants/landing-content";
import { HeroBackgroundMedia } from "@/features/home/components/HeroBackgroundMedia";
import {
  heroContentShellClass,
  heroSubtitleClass,
  heroTextBackdropClass,
  heroTitleClass,
} from "@/features/home/lib/hero-visual";
import {
  landingContainerClass,
  landingPrimaryButtonClass,
  landingSecondaryButtonClass,
} from "@/features/home/lib/landing-layout";
const TRUST_ICONS = {
  seats: UserRound,
  payment: Wallet,
  support: Clock,
} as const;

export function LandingHeroSection() {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section
      className="relative scroll-mt-20 overflow-hidden"
      aria-labelledby="landing-hero-title"
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
          <span className="mb-5 inline-flex rounded-md border border-primary/30 bg-primary/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-primary">
            {HERO_CONTENT.badge}
          </span>

          <h1
            id="landing-hero-title"
            className={heroTitleClass}
          >
            {HERO_CONTENT.titleBefore}
            <br className="hidden sm:block" />
            <span className="text-primary">{HERO_CONTENT.titleHighlight}</span>
          </h1>

          <p className={cn(heroSubtitleClass)}>
            Réservez votre place{" "}
            <strong className="font-semibold text-foreground">{HERO_CONTENT.subtitleBold}</strong>{" "}
            de nos navettes Châlons-en-Champagne ↔ Vatry en quelques clics.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to={ROUTES.trips}
              className={cn(landingPrimaryButtonClass, "w-full px-6 sm:w-auto")}
            >
              {HERO_CONTENT.ctaPrimary}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href={`#${LANDING_SECTION_IDS.pricing}`}
              className={cn(landingSecondaryButtonClass, "w-full sm:w-auto")}
            >
              <BadgePercent className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              {HERO_CONTENT.ctaSecondary}
            </a>
          </div>

          <ul className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:gap-x-8">
            {HERO_TRUST_ITEMS.map((item) => {
              const Icon = TRUST_ICONS[item.id as keyof typeof TRUST_ICONS];
              return (
                <li key={item.id} className="flex items-center gap-2.5 text-sm text-foreground/80">
                  <Icon className="h-4 w-4 shrink-0 text-foreground/95" aria-hidden />
                  <span>{item.label}</span>
                </li>
              );
            })}
          </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
