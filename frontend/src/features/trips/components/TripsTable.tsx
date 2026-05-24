import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, CheckCircle, Eye } from "lucide-react";
import { disableAdminTrip, enableAdminTrip } from "@/api/admin-trips.api";
import { ApiError } from "@/api/http";
import { Button } from "@/components/ui/Button";
import { queryKeys } from "@/constants/query-keys";
import { formatDate } from "@/lib/format-date";
import type { AdminTrip, TripOccupancy } from "@/types/trips.types";
import { deriveTripUiStatus } from "@/features/trips/utils/trip-ui-status";
import { OccupancyBadge } from "./OccupancyBadge";
import { StatusBadge } from "./StatusBadge";

export interface TripsTableProps {
  trips: AdminTrip[];
  selectedOccupancyTripId: string | null;
  selectedTripOccupancy: TripOccupancy | null;
  onViewOccupancy: (tripId: string) => void;
}

export function TripsTable({
  trips,
  selectedOccupancyTripId,
  selectedTripOccupancy,
  onViewOccupancy,
}: TripsTableProps) {
  const queryClient = useQueryClient();

  const disableMutation = useMutation({
    mutationFn: disableAdminTrip,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.trips.all });
    },
  });

  const enableMutation = useMutation({
    mutationFn: enableAdminTrip,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.trips.all });
    },
  });

  async function handleDisable(trip: AdminTrip) {
    const ok = window.confirm(
      `Désactiver le trajet du ${formatDate(trip.departureTime)} ? Les réservations publiques seront bloquées.`
    );
    if (!ok) return;
    try {
      await disableMutation.mutateAsync(trip.id);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Échec de la désactivation";
      window.alert(message);
    }
  }

  async function handleEnable(trip: AdminTrip) {
    const ok = window.confirm(`Réactiver ce trajet ?`);
    if (!ok) return;
    try {
      await enableMutation.mutateAsync(trip.id);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Échec de la réactivation";
      window.alert(message);
    }
  }

  const isMutating = disableMutation.isPending || enableMutation.isPending;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Départ</th>
            <th className="px-4 py-3 font-medium">Ligne</th>
            <th className="px-4 py-3 font-medium">Trajet</th>
            <th className="px-4 py-3 font-medium">Places</th>
            <th className="px-4 py-3 font-medium">Remplissage</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {trips.map((trip) => {
            const isSelected = selectedOccupancyTripId === trip.id;
            const occupancy =
              isSelected && selectedTripOccupancy ? selectedTripOccupancy : null;
            const uiStatus = deriveTripUiStatus(trip, occupancy);
            const routeLabel = `${trip.line.startCity} → ${trip.line.endCity}`;

            return (
              <tr
                key={trip.id}
                className={isSelected ? "bg-primary/5" : "hover:bg-muted/20"}
              >
                <td className="px-4 py-3 text-foreground">{formatDate(trip.departureTime)}</td>
                <td className="px-4 py-3 text-foreground">{trip.line.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{routeLabel}</td>
                <td className="px-4 py-3 font-mono text-foreground">{trip.totalSeats}</td>
                <td className="px-4 py-3">
                  {occupancy ? (
                    <OccupancyBadge
                      occupied={occupancy.occupiedSeats}
                      total={occupancy.totalSeats}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">À la demande</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={uiStatus} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant={isSelected ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => onViewOccupancy(trip.id)}
                      title="Voir remplissage"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {trip.deletedAt ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => handleEnable(trip)}
                        title="Réactiver"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => handleDisable(trip)}
                        title="Désactiver"
                      >
                        <Ban className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
