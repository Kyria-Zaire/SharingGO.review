import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatTime, formatTripDuration } from "@/lib/format-date";
import type { PublicTrip } from "@/types/trips.types";

export interface TripScheduleCardProps {
  trip: PublicTrip;
}

export function TripScheduleCard({ trip }: TripScheduleCardProps) {
  const duration = formatTripDuration(trip.departureTime, trip.arrivalTime);

  return (
    <Card className="mb-4 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" aria-hidden />
        <h3 className="text-sm font-medium text-foreground">Horaires</h3>
      </div>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Départ</dt>
          <dd className="mt-0.5 text-lg font-semibold text-foreground">
            {formatTime(trip.departureTime)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Arrivée</dt>
          <dd className="mt-0.5 text-lg font-semibold text-foreground">
            {trip.arrivalTime ? formatTime(trip.arrivalTime) : "—"}
          </dd>
        </div>
        {duration ? (
          <div className="col-span-2 border-t border-border pt-3">
            <dt className="text-muted-foreground">Durée estimée</dt>
            <dd className="mt-0.5 font-medium text-foreground">{duration}</dd>
          </div>
        ) : null}
      </dl>
    </Card>
  );
}
