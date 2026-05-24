import { Badge } from "@/components/ui/Badge";
import { TRIP_UI_STATUS_LABELS } from "@/constants/trip-status";
import type { TripUiStatus } from "@/types/trips.types";

const variantByStatus: Record<
  TripUiStatus,
  "default" | "success" | "warning" | "destructive" | "muted"
> = {
  active: "success",
  upcoming: "success",
  disabled: "muted",
  past: "muted",
  full: "destructive",
};

export interface StatusBadgeProps {
  status: TripUiStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={variantByStatus[status]}>{TRIP_UI_STATUS_LABELS[status]}</Badge>;
}
