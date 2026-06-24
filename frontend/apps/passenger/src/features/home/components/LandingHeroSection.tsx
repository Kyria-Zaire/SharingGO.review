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
      <div className="absolute inset-0" aria-hidden>
        {photoFailed ? (
          <div className="h-full w-full bg-gradient-to-br from-[#0c1220] via-[#06080d] to-[#030303]" />
        ) : (
          <img
            src={LANDING_ASSETS.heroVan}
            alt=""
            className="h-full w-full object-cover object-[72%_center] sm:object-[68%_center] lg:object-[75%_center]"
            loading="eager"
            fetchPriority="high"
            onError={() => setPhotoFailed(true)}
          />
        )}

        {/* Lisibilité texte à gauche — van visible à droite */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/10 lg:from-black/90 lg:via-black/50 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
      </div>

      <div className={cn(landingContainerClass, "relative z-10")}>
        <div className="relative max-w-xl py-12 sm:py-14 lg:min-h-[28rem] lg:py-20 lg:pr-8">
          <div
            className="pointer-events-none absolute -inset-x-4 -inset-y-5 rounded-3xl bg-gradient-to-r from-black/65 via-black/40 to-transparent sm:-inset-x-6 lg:-inset-x-10"
            aria-hidden
          />

          <div className="relative">
          <span className="mb-5 inline-flex rounded-md border border-primary/30 bg-primary/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-primary">
            {HERO_CONTENT.badge}
          </span>

          <h1
            id="landing-hero-title"
            className="text-[2rem] font-bold leading-[1.08] tracking-tight text-foreground [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] sm:text-4xl lg:text-[2.75rem] xl:text-5xl"
          >
            {HERO_CONTENT.titleBefore}
            <br className="hidden sm:block" />
            <span className="text-primary">{HERO_CONTENT.titleHighlight}</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-foreground/95 [text-shadow:0_1px_16px_rgba(0,0,0,0.45)] sm:text-[1.05rem]">
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
