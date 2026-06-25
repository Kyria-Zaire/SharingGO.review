import { Clock, Armchair, Shield, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass, landingContainerClass } from "@/features/home/lib/landing-layout";
import { TRIP_DETAIL_REASSURANCE } from "@/features/trips/constants/trip-detail-content";

const REASSURANCE_ICONS = {
  punctuality: Clock,
  comfort: Armchair,
  security: Shield,
  reliability: Star,
} as const;

export function TripDetailReassuranceBand() {
  return (
    <section
      className="border-t border-white/[0.06] py-10 lg:py-12"
      aria-labelledby="trip-reassurance-title"
    >
      <div className={landingContainerClass}>
        <h2 id="trip-reassurance-title" className="sr-only">
          Pourquoi voyager avec SharingGO
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
          {TRIP_DETAIL_REASSURANCE.map((item) => {
            const Icon = REASSURANCE_ICONS[item.id as keyof typeof REASSURANCE_ICONS];
            return (
              <article
                key={item.id}
                className={cn(
                  landingCardClass,
                  "flex h-full gap-4 bg-[#161616] p-5 transition-colors hover:border-white/10"
                )}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                  {Icon ? <Icon className="h-5 w-5" aria-hidden /> : null}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
