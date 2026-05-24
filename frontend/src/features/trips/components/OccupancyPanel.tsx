import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDate } from "@/lib/format-date";
import type { TripOccupancy } from "@/types/trips.types";
import { OccupancyBadge } from "./OccupancyBadge";

interface OccupancyPanelProps {
  tripId: string | null;
  occupancy: TripOccupancy | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onClose: () => void;
}

export function OccupancyPanel({
  tripId,
  occupancy,
  isLoading,
  isError,
  error,
  onRetry,
  onClose,
}: OccupancyPanelProps) {
  if (!tripId) {
    return null;
  }

  return (
    <Card className="mt-6 border-primary/30">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Remplissage du trajet</h3>
          <p className="text-sm text-muted-foreground">
            Données chargées à la demande — source API admin occupancy.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fermer">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement du remplissage…</p>
      ) : null}

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Impossible de charger le remplissage"}
          onRetry={onRetry}
          className="py-8"
        />
      ) : null}

      {occupancy ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <OccupancyBadge occupied={occupancy.occupiedSeats} total={occupancy.totalSeats} />
            <span className="text-sm text-muted-foreground">
              {occupancy.remainingSeats} place(s) restante(s)
            </span>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Confirmées</dt>
              <dd className="font-medium text-foreground">{occupancy.confirmedSeats}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Utilisées</dt>
              <dd className="font-medium text-foreground">{occupancy.usedSeats}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pending actives</dt>
              <dd className="font-medium text-foreground">{occupancy.activePendingSeats}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Départ</dt>
              <dd className="font-medium text-foreground">
                {formatDate(occupancy.trip.departureTime)}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">
            {occupancy.trip.line.startCity} → {occupancy.trip.line.endCity}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
