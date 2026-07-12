import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { getReservationStatusView } from "@/lib/reservation-status";
import type { RefundStatus, ReservationStatus } from "@/types/reservations";

function resolveDetailStatusLabel(
  status: string,
  isPastTrip: boolean,
  refundStatus: RefundStatus | undefined
): string {
  if (status === "USED" || (status === "CONFIRMED" && isPastTrip)) {
    return "Terminée";
  }
  return getReservationStatusView(status, refundStatus).label;
}

function detailStatusBadgeClass(
  status: string,
  isPastTrip: boolean,
  refundStatus: RefundStatus | undefined
): string {
  const normalized = status as ReservationStatus;
  if (normalized === "USED" || (normalized === "CONFIRMED" && isPastTrip)) {
    return "border-0 bg-white/10 text-foreground";
  }
  switch (normalized) {
    case "CONFIRMED":
      return "border-primary/50 text-primary bg-primary/5";
    case "PENDING":
      return "border-sky-500/50 text-sky-400 bg-sky-500/10";
    case "CANCELED":
      if (refundStatus === "PENDING") {
        return "border-warning/40 bg-warning/10 text-warning";
      }
      if (refundStatus === "REFUNDED" || refundStatus === "CREDITED") {
        return "border-white/15 bg-white/[0.06] text-muted-foreground";
      }
      return "border-destructive/40 bg-destructive/10 text-destructive";
    default:
      return "border-white/15 bg-white/[0.06] text-muted-foreground";
  }
}

export function BookingDetailStatusBadge({
  status,
  isPastTrip = false,
  refundStatus,
  className,
}: {
  status: string;
  isPastTrip?: boolean;
  refundStatus?: RefundStatus;
  className?: string;
}) {
  const label = resolveDetailStatusLabel(status, isPastTrip, refundStatus);
  const normalized = status as ReservationStatus;
  const isCompleted = normalized === "USED" || (normalized === "CONFIRMED" && isPastTrip);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        isCompleted ? "border-0" : "border",
        detailStatusBadgeClass(status, isPastTrip, refundStatus),
        className
      )}
    >
      {normalized === "CONFIRMED" && !isPastTrip ? (
        <Check className="h-3 w-3" aria-hidden />
      ) : null}
      {normalized === "PENDING" ? <Clock className="h-3 w-3" aria-hidden /> : null}
      {label}
    </span>
  );
}
