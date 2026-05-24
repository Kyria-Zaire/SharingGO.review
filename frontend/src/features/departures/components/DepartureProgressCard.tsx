import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/format-date";
import type { DepartureTripView } from "@/types/departures.types";
import { BoardingProgressBar } from "./BoardingProgressBar";
import { DepartureIncidentBadge } from "./DepartureIncidentBadge";
import { DepartureReadinessBadge } from "./DepartureReadinessBadge";
import { NearDepartureBadge } from "./NearDepartureBadge";

interface DepartureProgressCardProps {
  view: DepartureTripView;
}

export function DepartureProgressCard({ view }: DepartureProgressCardProps) {
  const nearClass = view.nearDeparture
    ? "border-warning/40 shadow-sm shadow-warning/10 ring-1 ring-warning/20"
    : "border-border";

  return (
    <article
      className={cn(
        "rounded-lg border bg-muted/30 p-4 transition-shadow",
        nearClass,
        view.isDisabled && "opacity-60"
      )}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{view.lineName}</p>
          <h3 className="text-lg font-semibold text-foreground">{view.routeLabel}</h3>
          <p className="text-sm text-muted-foreground">{formatDate(view.departureTime)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NearDepartureBadge nearDeparture={view.nearDeparture} />
          <DepartureReadinessBadge status={view.readiness} size="lg" />
        </div>
      </div>

      {view.boardingComplete ? (
        <p className="mb-3 text-sm font-semibold text-primary">Boarding complete</p>
      ) : null}

      <BoardingProgressBar percent={view.percentBoarded} className="mb-4" />

      <dl className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Occupés</dt>
          <dd className="font-semibold text-foreground">
            {view.occupiedSeats} / {view.totalSeats}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Embarqués</dt>
          <dd className="font-semibold text-primary">{view.boardedCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Restants</dt>
          <dd className="font-semibold text-foreground">{view.remainingBoardingCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Pending</dt>
          <dd className="font-semibold text-muted-foreground">{view.activePendingSeats}</dd>
        </div>
      </dl>

      {view.incidents.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {view.incidents.map((incident) => (
            <DepartureIncidentBadge key={incident.id} incident={incident} />
          ))}
        </div>
      ) : null}

      <Link
        to={`${ROUTES.incidents}?tripId=${encodeURIComponent(view.tripId)}&category=departure&create=1`}
        className="mt-3 inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted/30"
      >
        Signaler incident
      </Link>
    </article>
  );
}
