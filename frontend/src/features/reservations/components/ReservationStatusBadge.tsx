import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { RESERVATION_STATUS_LABELS } from "@/constants/statuses";
import type { ReservationStatus } from "@/types/reservations.types";

const variantByStatus: Record<
  ReservationStatus,
  "default" | "success" | "warning" | "destructive" | "muted"
> = {
  CONFIRMED: "success",
  USED: "success",
  PENDING: "warning",
  CANCELED: "muted",
  EXPIRED: "destructive",
};

export interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  className?: string;
}

export function ReservationStatusBadge({ status, className }: ReservationStatusBadgeProps) {
  const isUsed = status === "USED";

  return (
    <Badge
      variant={variantByStatus[status] ?? "muted"}
      className={cn(isUsed && "border-primary/40 bg-primary/15 text-primary", className)}
    >
      {RESERVATION_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
