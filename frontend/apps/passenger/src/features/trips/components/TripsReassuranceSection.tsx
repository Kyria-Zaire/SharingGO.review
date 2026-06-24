import { CalendarCheck, Headphones, ShieldCheck, Ticket } from "lucide-react";
import { cn } from "@/lib/cn";
import { TRIPS_REASSURANCE_ITEMS } from "@/features/trips/constants/trips-content";
import {
  landingCardClass,
  landingContainerClass,
  landingSectionClass,
} from "@/features/home/lib/landing-layout";

const REASSURANCE_ICONS = {
  seats: Ticket,
  payment: ShieldCheck,
  cancel: CalendarCheck,
  support: Headphones,
} as const;

export function TripsReassuranceSection() {
  return (
    <section
      className={cn(landingSectionClass, "border-t border-white/[0.06]")}
      aria-labelledby="trips-reassurance-title"
    >
      <div className={landingContainerClass}>
        <h2 id="trips-reassurance-title" className="sr-only">
          Pourquoi réserver avec SharingGO
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRIPS_REASSURANCE_ITEMS.map((item) => {
            const Icon = REASSURANCE_ICONS[item.id as keyof typeof REASSURANCE_ICONS];
            return (
              <article
                key={item.id}
                className={cn(
                  landingCardClass,
                  "flex gap-4 bg-[#161616] p-5 transition-colors hover:border-white/10"
                )}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                  {Icon ? <Icon className="h-5 w-5" aria-hidden /> : null}
                </span>
                <div className="min-w-0">
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
