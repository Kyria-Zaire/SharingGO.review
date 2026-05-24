import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

/**
 * V1: "Soon" badge for departures within threshold.
 * V2: replace label via formatDepartureCountdownLabel().
 */
export interface NearDepartureBadgeProps {
  nearDeparture: boolean;
  className?: string;
}

export function NearDepartureBadge({ nearDeparture, className }: NearDepartureBadgeProps) {
  if (!nearDeparture) return null;

  return (
    <Badge variant="warning" className={cn("gap-1 font-medium", className)}>
      <Clock className="h-3 w-3" />
      Soon
    </Badge>
  );
}
