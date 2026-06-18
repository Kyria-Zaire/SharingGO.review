import { Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { PublicTrip } from "@/types/trips.types";

export interface TripSeatsCardProps {
  trip: PublicTrip;
}

export function TripSeatsCard({ trip }: TripSeatsCardProps) {
  return (
    <Card className="mb-4 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" aria-hidden />
        <h3 className="text-sm font-medium text-foreground">Places</h3>
      </div>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Restantes</dt>
          <dd className="mt-0.5 text-lg font-semibold text-foreground">
            {trip.remainingSeats}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Capacité</dt>
          <dd className="mt-0.5 text-lg font-semibold text-foreground">{trip.totalSeats}</dd>
        </div>
        <div className="col-span-2 text-muted-foreground">
          {trip.reservedSeats <= 1
            ? `${trip.reservedSeats} place déjà réservée`
            : `${trip.reservedSeats} places déjà réservées`}
        </div>
      </dl>
    </Card>
  );
}
