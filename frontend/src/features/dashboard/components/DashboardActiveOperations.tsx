import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { relativeTime } from "@/lib/relativeTime";
import {
  DashboardWidget,
  DashboardWidgetEmpty,
  DashboardWidgetLoading,
} from "@/features/dashboard/components/DashboardWidget";
import type { AdminIncident } from "@/types/incidents.types";
import type { DepartureTripView } from "@/types/departures.types";

function OpsListItem({
  title,
  detail,
  href,
}: {
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <li>
      <Link
        to={href}
        className="block rounded-md border border-border/80 bg-background/40 px-3 py-2 hover:border-primary/40 hover:bg-muted/30"
      >
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </Link>
    </li>
  );
}

export function DashboardActiveOperations({
  boardingTrips,
  nearDepartures,
  criticalIncidents,
  isLoading,
}: {
  boardingTrips: DepartureTripView[];
  nearDepartures: DepartureTripView[];
  criticalIncidents: AdminIncident[];
  isLoading: boolean;
}) {
  const hasContent =
    boardingTrips.length > 0 || nearDepartures.length > 0 || criticalIncidents.length > 0;

  return (
    <DashboardWidget
      title="Active Operations"
      description="Boarding, départs imminents et incidents critiques en cours"
      tone="ops"
    >
      {isLoading ? (
        <DashboardWidgetLoading />
      ) : !hasContent ? (
        <DashboardWidgetEmpty message="Aucune opération active urgente pour le moment." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-primary">Boarding en cours</p>
            {boardingTrips.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucun</p>
            ) : (
              <ul className="space-y-2">
                {boardingTrips.map((departure) => (
                  <OpsListItem
                    key={departure.tripId}
                    title={departure.routeLabel}
                    detail={`${departure.percentBoarded}% embarqués · ${relativeTime(departure.departureTime)}`}
                    href={ROUTES.boarding}
                  />
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-warning">Départs imminents</p>
            {nearDepartures.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucun</p>
            ) : (
              <ul className="space-y-2">
                {nearDepartures.map((departure) => (
                  <OpsListItem
                    key={departure.tripId}
                    title={departure.routeLabel}
                    detail={`${departure.lineName} · ${departure.remainingBoardingCount} restant(s)`}
                    href={ROUTES.departures}
                  />
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-destructive">
              Incidents critiques
            </p>
            {criticalIncidents.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucun</p>
            ) : (
              <ul className="space-y-2">
                {criticalIncidents.map((incident) => (
                  <OpsListItem
                    key={incident.id}
                    title={incident.title}
                    detail={`${incident.code} · ${relativeTime(incident.createdAt)}`}
                    href={ROUTES.incidents}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </DashboardWidget>
  );
}
