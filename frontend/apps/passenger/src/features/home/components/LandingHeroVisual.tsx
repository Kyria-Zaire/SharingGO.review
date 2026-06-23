import { useState } from "react";
import { cn } from "@/lib/cn";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";

export interface LandingHeroVisualProps {
  className?: string;
  showCarousel?: boolean;
}

function HeroVisualFallback() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c1220] via-[#06080d] to-[#030303]" />
      <div className="absolute -left-8 top-8 h-56 w-56 rounded-full bg-amber-500/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-black/30" />
    </>
  );
}

export function LandingHeroVisual({ className, showCarousel = false }: LandingHeroVisualProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-[1.25rem]",
        "border border-white/[0.1]",
        "shadow-[0_28px_90px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]",
        "min-h-[16rem] sm:min-h-[18rem] lg:min-h-[22rem]",
        className
      )}
    >
      {/* Halo vert — présence maquette */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-[1.5rem] bg-primary/10 blur-3xl"
        aria-hidden
      />

      <div className="relative h-full min-h-[inherit] w-full">
        {photoFailed ? (
          <HeroVisualFallback />
        ) : (
          <img
            src={LANDING_ASSETS.heroVan}
            alt="Navette SharingGO noire devant le terminal de Vatry de nuit"
            className="absolute inset-0 h-full w-full object-cover object-[62%_center] transition-transform duration-500 group-hover:scale-[1.02]"
            loading="eager"
            fetchPriority="high"
            onError={() => setPhotoFailed(true)}
          />
        )}

        {/* Overlay cinématique — densité visuelle */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.08]" />
      </div>

      {showCarousel ? (
        <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-1.5 md:hidden" aria-hidden>
          <span className="h-1.5 w-6 rounded-full bg-foreground" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
        </div>
      ) : null}
    </div>
  );
}
