import { ArrowRight, CirclePlay, Headphones, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/types/routes";
import {
  HERO_CONTENT,
  HERO_TRUST_ITEMS,
  LANDING_SECTION_IDS,
} from "@/features/home/constants/landing-content";
import {
  landingContainerClass,
  landingPrimaryButtonClass,
  landingSectionClass,
} from "@/features/home/lib/landing-layout";
import { LandingHeroVisual } from "./LandingHeroVisual";

const TRUST_ICONS = {
  seats: Users,
  payment: ShieldCheck,
  support: Headphones,
} as const;

export function LandingHeroSection() {
  return (
    <section className={cn(landingSectionClass, "pt-6 lg:pt-10")} aria-labelledby="landing-hero-title">
      <div className={landingContainerClass}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="max-w-xl">
            <Badge
              variant="success"
              className="mb-5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
            >
              {HERO_CONTENT.badge}
            </Badge>

            <h1
              id="landing-hero-title"
              className="text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-[3.25rem]"
            >
              {HERO_CONTENT.titleBefore}{" "}
              <span className="text-primary">{HERO_CONTENT.titleHighlight}</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Réservez votre place{" "}
              <strong className="font-semibold text-foreground">{HERO_CONTENT.subtitleBold}</strong>{" "}
              de nos navettes Châlons-en-Champagne ↔ Vatry en quelques clics.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to={ROUTES.trips} className={cn(landingPrimaryButtonClass, "w-full sm:w-auto")}>
                {HERO_CONTENT.ctaPrimary}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={`#${LANDING_SECTION_IDS.howItWorks}`}
                className={cn(
                  "inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 active:scale-[0.98] sm:w-auto",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                {HERO_CONTENT.ctaSecondary}
                <CirclePlay className="h-4 w-4 text-muted-foreground" aria-hidden />
              </a>
            </div>

            <ul className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
              {HERO_TRUST_ITEMS.map((item) => {
                const Icon = TRUST_ICONS[item.id as keyof typeof TRUST_ICONS];
                return (
                  <li key={item.id} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:pl-4">
            <LandingHeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
