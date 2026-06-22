import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { TripLifecycleStatus } from "@/types/trips.types";
import { TRIP_LIFECYCLE_DISPLAY } from "@/features/departures/utils/trip-lifecycle-display";

interface TripLifecycleBadgeProps {
  status: TripLifecycleStatus;
  className?: string;
}

export function TripLifecycleBadge({ status, className }: TripLifecycleBadgeProps) {
  const display = TRIP_LIFECYCLE_DISPLAY[status];
  return (
    <Badge
      variant="default"
      className={cn("font-semibold uppercase tracking-wide", display.badgeClassName, className)}
    >
      Lifecycle: {display.label}
    </Badge>
  );
}

