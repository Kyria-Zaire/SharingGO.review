import { Badge } from "@/components/ui/Badge";
import type { TripAvailabilityStatus } from "@/types/trips.types";
import type { BadgeVariant } from "@/types/ui.types";

const VARIANTS: Record<TripAvailabilityStatus, BadgeVariant> = {
  available: "success",
  almost_full: "warning",
  full: "destructive",
  unavailable: "muted",
  past: "muted",
};

export interface TripAvailabilityBadgeProps {
  label: string;
  status: TripAvailabilityStatus;
}

export function TripAvailabilityBadge({ label, status }: TripAvailabilityBadgeProps) {
  return <Badge variant={VARIANTS[status]}>{label}</Badge>;
}
