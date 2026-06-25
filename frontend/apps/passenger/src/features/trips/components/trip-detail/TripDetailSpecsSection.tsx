import {
  Accessibility,
  Bus,
  CalendarDays,
  Luggage,
  PawPrint,
  Repeat,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import {
  TRIP_DETAIL_SPECS,
  TRIP_DETAIL_SPECS_DESKTOP,
} from "@/features/trips/constants/trip-detail-content";

const MOBILE_SPEC_ICONS = {
  frequency: Repeat,
  type: Bus,
  capacity: Users,
  luggage: Luggage,
} as const satisfies Record<(typeof TRIP_DETAIL_SPECS)[number]["id"], LucideIcon>;

const DESKTOP_SPEC_ICONS = {
  frequency: CalendarDays,
  type: Bus,
  luggage: Luggage,
  accessibility: Accessibility,
  animals: PawPrint,
} as const satisfies Record<(typeof TRIP_DETAIL_SPECS_DESKTOP)[number]["id"], LucideIcon>;

function MobileSpecsGrid() {
  return (
    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
      {TRIP_DETAIL_SPECS.map((spec) => {
        const Icon = MOBILE_SPEC_ICONS[spec.id];
        return (
          <div
            key={spec.id}
            className="flex gap-3 rounded-xl border border-white/[0.06] bg-[#121212] p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {spec.label}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-foreground">{spec.value}</dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}

function DesktopSpecsList() {
  return (
    <dl className="mt-5 divide-y divide-white/[0.06]">
      {TRIP_DETAIL_SPECS_DESKTOP.map((spec) => {
        const Icon = DESKTOP_SPEC_ICONS[spec.id];
        return (
          <div key={spec.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <dt className="shrink-0 text-sm text-muted-foreground">{spec.label}</dt>
            <dd className="ml-auto max-w-[55%] text-right text-sm leading-snug text-foreground">
              {spec.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function TripDetailSpecsSection() {
  return (
    <section
      className={cn(landingCardClass, "h-full bg-[#161616] p-5 sm:p-6 md:p-5 lg:p-6")}
      aria-labelledby="trip-specs-title"
    >
      <h2 id="trip-specs-title" className="text-base font-semibold text-foreground">
        Détails du trajet
      </h2>

      <div className="md:hidden">
        <MobileSpecsGrid />
      </div>

      <div className="hidden md:block">
        <DesktopSpecsList />
      </div>
    </section>
  );
}
