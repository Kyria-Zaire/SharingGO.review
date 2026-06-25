import { Check, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import {
  BOOKING_FORM_ACTIVE_STEP,
  BOOKING_FORM_BACK_LABEL,
  BOOKING_FORM_STEPS,
  BOOKING_FORM_TITLE,
} from "@/features/booking-form/constants/booking-form-content";
import { ROUTES } from "@/types/routes";

export function BookingFormHeader({ tripId }: { tripId: string }) {
  return (
    <header className="space-y-4">
      <Link
        to={ROUTES.tripDetail(tripId)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        {BOOKING_FORM_BACK_LABEL}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
        {BOOKING_FORM_TITLE}
      </h1>
    </header>
  );
}

export function BookingFormStepIndicator() {
  const activeIndex = BOOKING_FORM_STEPS.findIndex((step) => step.id === BOOKING_FORM_ACTIVE_STEP);

  return (
    <nav aria-label="Étapes de réservation">
      <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
        {BOOKING_FORM_STEPS.map((step, index) => {
          const isActive = step.id === BOOKING_FORM_ACTIVE_STEP;
          const isComplete = index < activeIndex;

          return (
            <li key={step.id} className="flex items-center gap-2">
              {index > 0 ? (
                <span className="hidden h-px w-4 bg-white/15 sm:block" aria-hidden />
              ) : null}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium sm:px-3 sm:text-sm",
                  isActive && "border-primary/50 bg-primary/10 text-primary",
                  isComplete && "border-primary/30 text-primary",
                  !isActive && !isComplete && "border-white/10 text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 w-5 items-center justify-center rounded-full text-[0.625rem] font-bold",
                    isActive && "bg-primary text-primary-foreground",
                    isComplete && "bg-primary/20 text-primary",
                    !isActive && !isComplete && "bg-white/5 text-muted-foreground"
                  )}
                  aria-hidden
                >
                  {isComplete ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
