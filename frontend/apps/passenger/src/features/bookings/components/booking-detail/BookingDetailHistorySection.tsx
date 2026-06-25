import { useState } from "react";
import { Check, ChevronDown, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  BOOKING_DETAIL_CANCEL_CTA,
  BOOKING_DETAIL_CANCEL_NOTICE,
} from "@/features/bookings/constants/booking-detail-content";
import {
  buildBookingHistorySteps,
  formatHistoryStepDate,
  type BookingHistoryStep,
} from "@/features/bookings/lib/booking-detail-history";
import type { UserReservationDetail } from "@/types/reservations";

const CARD_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

function HistoryStepIcon({ step }: { step: BookingHistoryStep }) {
  if (step.variant === "failure") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <X className="h-3.5 w-3.5" aria-hidden />
      </span>
    );
  }

  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
      <Check className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
}

function HistoryConnector({
  step,
  isLast,
}: {
  step: BookingHistoryStep;
  isLast: boolean;
}) {
  if (isLast) {
    return null;
  }

  return (
    <span
      className={cn(
        "mt-1 min-h-6 w-px flex-1",
        step.variant === "failure" ? "bg-destructive/35" : "bg-primary/35"
      )}
      aria-hidden
    />
  );
}

export function BookingDetailHistorySection({
  reservation,
  canCancel,
}: {
  reservation: UserReservationDetail;
  canCancel: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const steps = buildBookingHistorySteps(reservation);

  return (
    <section className={CARD_CLASS} aria-label="Historique de la réservation">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">
          Historique de votre réservation
        </h2>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          {expanded ? "Voir moins" : "Voir plus"}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            aria-hidden
          />
        </button>
      </div>

      {expanded ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-6">
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <HistoryStepIcon step={step} />
                  <HistoryConnector step={step} isLast={index >= steps.length - 1} />
                </div>
                <div className="pb-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      step.variant === "failure" ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatHistoryStepDate(step.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {canCancel ? (
            <aside className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Besoin de modifier ou d&apos;annuler ?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{BOOKING_DETAIL_CANCEL_NOTICE}</p>
              <button
                type="button"
                disabled
                className="mt-4 inline-flex min-h-[2.5rem] w-full items-center justify-center gap-2 rounded-lg border border-destructive/40 px-4 text-sm font-semibold text-foreground opacity-60"
                title="Annulation en ligne — bientôt disponible"
              >
                <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                {BOOKING_DETAIL_CANCEL_CTA}
              </button>
            </aside>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
