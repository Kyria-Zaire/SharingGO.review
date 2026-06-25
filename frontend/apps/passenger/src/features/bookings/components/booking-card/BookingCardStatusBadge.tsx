import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { getReservationStatusView } from "@/lib/reservation-status";
import type { ReservationStatus } from "@/types/reservations";
import type { BookingsFilter } from "@/hooks/useUserReservations";

function resolveStatusLabel(status: string, filter: BookingsFilter): string {
  if (status === "USED" && filter === "past") {
    return "Terminée";
  }
  return getReservationStatusView(status).label;
}

function statusBadgeClass(status: string, filter: BookingsFilter): string {
  const normalized = status as ReservationStatus;
  if (normalized === "USED" && filter === "past") {
    return "border-0 bg-white/10 text-foreground";
  }
  switch (normalized) {
    case "CONFIRMED":
      return "border-primary/50 text-primary bg-primary/5";
    case "PENDING":
      return "border-sky-500/50 text-sky-400 bg-sky-500/10";
    case "USED":
      return "border-white/15 bg-white/[0.06] text-muted-foreground";
    case "CANCELED":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    default:
      return "border-white/15 bg-white/[0.06] text-muted-foreground";
  }
}

export function BookingCardStatusBadge({
  status,
  filter,
  className,
}: {
  status: string;
  filter: BookingsFilter;
  className?: string;
}) {
  const label = resolveStatusLabel(status, filter);
  const normalized = status as ReservationStatus;
  const isCompletedPast = normalized === "USED" && filter === "past";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        isCompletedPast ? "border-0" : "border",
        statusBadgeClass(status, filter),
        className
      )}
    >
      {normalized === "CONFIRMED" ? <Check className="h-3 w-3" aria-hidden /> : null}
      {normalized === "PENDING" ? <Clock className="h-3 w-3" aria-hidden /> : null}
      {label}
    </span>
  );
}
