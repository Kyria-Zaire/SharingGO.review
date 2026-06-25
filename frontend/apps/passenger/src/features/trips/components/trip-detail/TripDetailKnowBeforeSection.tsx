import { useState, type ReactNode } from "react";
import { Check, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import {
  TRIP_DETAIL_KNOW_BEFORE,
  TRIP_DETAIL_KNOW_BEFORE_CHECKLIST,
} from "@/features/trips/constants/trip-detail-content";
import { TripDetailShuttleAboutCard } from "@/features/trips/components/trip-detail/TripDetailShuttleAboutCard";

function KnowBeforeAccordionItem({
  title,
  panelId,
  children,
}: {
  title: string;
  panelId: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerId = `${panelId}-trigger`;

  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-touch w-full items-center justify-between gap-3 py-3 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!open} className="pb-3">
        <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function DesktopKnowBeforePanel() {
  return (
    <div className="mt-5 flex flex-1 flex-col">
      <ul className="space-y-4">
        {TRIP_DETAIL_KNOW_BEFORE_CHECKLIST.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary"
              aria-hidden
            >
              <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
            </span>
            <span className="text-sm leading-relaxed text-foreground">{item.text}</span>
          </li>
        ))}
      </ul>
      <TripDetailShuttleAboutCard className="mt-6" />
    </div>
  );
}

export function TripDetailKnowBeforeSection() {
  return (
    <section
      className={cn(landingCardClass, "flex h-full flex-col bg-[#161616] p-5 sm:p-6 md:p-5 lg:p-6")}
      aria-labelledby="trip-know-title"
    >
      <div className="mb-4 flex items-center gap-2 md:mb-0">
        <Info className="h-4 w-4 text-primary md:hidden" aria-hidden />
        <h2 id="trip-know-title" className="text-base font-semibold text-foreground">
          Ce qu&apos;il faut savoir
        </h2>
      </div>

      <div className="hidden md:flex md:flex-1 md:flex-col">
        <DesktopKnowBeforePanel />
      </div>

      <div className="md:hidden">
        {TRIP_DETAIL_KNOW_BEFORE.map((item) => (
          <KnowBeforeAccordionItem key={item.id} title={item.title} panelId={`know-${item.id}`}>
            {item.description}
          </KnowBeforeAccordionItem>
        ))}
      </div>
    </section>
  );
}
