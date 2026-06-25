import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatBookingPublicReference } from "@/features/bookings/lib/booking-card-format";

export function BookingCardReferenceRow({
  reservationId,
  dense = false,
}: {
  reservationId: string;
  dense?: boolean;
}) {
  const reference = formatBookingPublicReference(reservationId);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        dense ? "mt-2" : "mt-3"
      )}
    >
      <span>
        Réf. : <span className="font-medium text-foreground/85">{reference}</span>
      </span>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        aria-label={copied ? "Référence copiée" : "Copier la référence"}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
    </div>
  );
}
