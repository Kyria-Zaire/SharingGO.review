import { Bus, CreditCard, QrCode, Ticket } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  TRIPS_HOW_IT_WORKS_STEPS,
  TRIPS_SECTION_IDS,
} from "@/features/trips/constants/trips-content";
import {
  landingCardClass,
  landingContainerClass,
  landingSectionClass,
} from "@/features/home/lib/landing-layout";

const STEP_ICONS = [Ticket, CreditCard, QrCode, Bus] as const;

export function TripsHowItWorksSection() {
  return (
    <section
      id={TRIPS_SECTION_IDS.howItWorks}
      className={cn(landingSectionClass, "border-t border-white/[0.06]")}
      aria-labelledby="trips-how-title"
    >
      <div className={landingContainerClass}>
        <h2
          id="trips-how-title"
          className="mb-8 text-center text-xl font-bold text-foreground sm:text-2xl"
        >
          Comment fonctionne SharingGO ?
        </h2>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRIPS_HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? Ticket;
            return (
              <li
                key={step.step}
                className={cn(landingCardClass, "flex flex-col gap-4 bg-[#161616] p-5")}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                    aria-hidden
                  >
                    {step.step}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
