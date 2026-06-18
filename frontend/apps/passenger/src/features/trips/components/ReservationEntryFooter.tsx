import { Button } from "@/components/ui/Button";
import { TICKET_PRICE_LABEL } from "@/constants/pricing";
import type { TripDetailReservationCta } from "@/lib/trip-availability";

export interface ReservationEntryFooterProps {
  cta: TripDetailReservationCta;
  comingSoonMessage?: string | null;
  onReserveClick: () => void;
}

export function ReservationEntryFooter({
  cta,
  comingSoonMessage,
  onReserveClick,
}: ReservationEntryFooterProps) {
  return (
    <div
      className="fixed inset-x-0 z-20 border-t border-border bg-background/95 backdrop-blur-sm"
      style={{
        bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="mx-auto flex w-full max-w-lg items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Ticket</p>
          <p className="text-lg font-semibold text-primary">{TICKET_PRICE_LABEL}</p>
        </div>
        <Button
          variant={cta.disabled ? "secondary" : "primary"}
          size="lg"
          className="min-w-[10rem] shrink-0"
          disabled={cta.disabled}
          onClick={onReserveClick}
        >
          {cta.label}
        </Button>
      </div>
      {comingSoonMessage ? (
        <p
          className="mx-auto max-w-lg px-4 pb-3 text-center text-xs text-muted-foreground"
          role="status"
        >
          {comingSoonMessage}
        </p>
      ) : null}
    </div>
  );
}
