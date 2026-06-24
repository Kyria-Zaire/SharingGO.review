import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/types/routes";
import { LANDING_SECTION_IDS } from "@/features/home/constants/landing-content";

const primaryLinkClass =
  "inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80 sm:w-auto sm:px-6";

const secondaryLinkClass =
  "inline-flex min-h-touch w-full items-center justify-center rounded-md border border-border bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 active:bg-muted/60 sm:w-auto sm:px-6";

export function HeroSection() {
  return (
    <section className="pb-8 pt-1 lg:pb-12" aria-labelledby="landing-hero-title">
      <div className="max-w-2xl lg:max-w-3xl">
      <Badge variant="success" className="mb-4">
        Navette professionnelle
      </Badge>

      <h1
        id="landing-hero-title"
        className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl"
      >
        Votre navette vers Vatry
      </h1>

      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Transport dédié aux convoyeurs et professionnels entre Châlons-en-Champagne et
        l&apos;aéroport Paris-Vatry.
      </p>

      <div className={cn("mt-6 flex flex-col gap-3 sm:flex-row sm:items-center")}>
        <Link to={ROUTES.trips} className={primaryLinkClass}>
          Voir les trajets
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <a href={`#${LANDING_SECTION_IDS.howItWorks}`} className={secondaryLinkClass}>
          Comment ça fonctionne
        </a>
      </div>
      </div>
    </section>
  );
}
