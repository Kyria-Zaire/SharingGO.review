import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminTripOccupancy } from "@/api/admin-trips.api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/format-date";
import { isAdminPanelRole } from "@/constants/roles";
import type { DepartureTripView } from "@/types/departures.types";
import type { AdminIncident } from "@/types/incidents.types";
import type { UserType } from "@/types/auth.types";
import type { TripOccupancy } from "@/types/trips.types";
import { BoardingProgressBar } from "./BoardingProgressBar";
import { DepartureIncidentBadge } from "./DepartureIncidentBadge";
import { DepartureReadinessBadge } from "./DepartureReadinessBadge";
import { NearDepartureBadge } from "./NearDepartureBadge";
import { PromotedIncidentBadge } from "./PromotedIncidentBadge";
import { TripLifecycleBadge } from "./TripLifecycleBadge";
import {
  TripLifecycleActionDialog,
  type TripLifecycleDialogAction,
} from "./TripLifecycleActionDialog";
import {
  getPromotedIncidentsForTrip,
  promotedIncidentKey,
} from "@/features/departures/utils/promoted-incident-utils";

interface DepartureProgressCardProps {
  view: DepartureTripView;
  userType?: UserType;
  promotedMap: Map<string, AdminIncident>;
  onPromote?: (view: DepartureTripView) => void;
  isLifecyclePending?: boolean;
  onLifecycleAction?: (
    tripId: string,
    action: "start-boarding" | "depart" | "complete" | "cancel",
    reason?: string
  ) => Promise<void>;
}

export function DepartureProgressCard({
  view,
  userType,
  promotedMap,
  onPromote,
  isLifecyclePending = false,
  onLifecycleAction,
}: DepartureProgressCardProps) {
  const [dialogAction, setDialogAction] = useState<TripLifecycleDialogAction | null>(null);
  const [occupancy, setOccupancy] = useState<TripOccupancy | null>(null);
  const [isLoadingOccupancy, setIsLoadingOccupancy] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);
  const occupancyRequestRef = useRef(0);

  const nearClass = view.nearDeparture
    ? "border-warning/40 shadow-sm shadow-warning/10 ring-1 ring-warning/20"
    : "border-border";

  const promotedForTrip = getPromotedIncidentsForTrip(view.tripId, promotedMap);
  const unpromotedHeuristics = view.incidents.filter(
    (incident) => !promotedMap.has(promotedIncidentKey(view.tripId, incident.heuristicKind))
  );
  const canPromote =
    Boolean(onPromote) &&
    Boolean(userType && isAdminPanelRole(userType)) &&
    unpromotedHeuristics.length > 0;
  const canManageLifecycle = Boolean(userType && isAdminPanelRole(userType) && onLifecycleAction);

  const absents = useMemo(() => {
    if (!occupancy) return 0;
    return Math.max(0, occupancy.occupiedSeats - occupancy.usedSeats);
  }, [occupancy]);

  const cancelSeverityClass =
    occupancy && occupancy.usedSeats > 0
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : "border-yellow-500/40 bg-yellow-500/10 text-yellow-300";

  function resetDialogState() {
    occupancyRequestRef.current += 1;
    setDialogAction(null);
    setOccupancy(null);
    setIsLoadingOccupancy(false);
    setCancelReason("");
    setDialogError(null);
  }

  async function handleStartBoarding() {
    if (!onLifecycleAction) return;
    setDialogError(null);
    try {
      await onLifecycleAction(view.tripId, "start-boarding");
    } catch {
      // erreurs gérées via toast page
    }
  }

  async function openActionDialog(action: TripLifecycleDialogAction) {
    const requestId = occupancyRequestRef.current + 1;
    occupancyRequestRef.current = requestId;
    setDialogAction(action);
    setCancelReason("");
    setDialogError(null);
    setIsLoadingOccupancy(false);
    setOccupancy(null);

    if (action === "depart" || action === "cancel") {
      setIsLoadingOccupancy(true);
      try {
        const data = await getAdminTripOccupancy(view.tripId);
        if (occupancyRequestRef.current !== requestId) return;
        setOccupancy(data);
      } catch {
        if (occupancyRequestRef.current !== requestId) return;
        setDialogError("Impossible de charger les compteurs temps réel.");
      } finally {
        if (occupancyRequestRef.current === requestId) {
          setIsLoadingOccupancy(false);
        }
      }
    }
  }

  async function submitDialogAction() {
    if (!dialogAction || !onLifecycleAction) return;
    setDialogError(null);
    try {
      if (dialogAction === "depart") {
        await onLifecycleAction(view.tripId, "depart");
      } else if (dialogAction === "complete") {
        await onLifecycleAction(view.tripId, "complete");
      } else {
        const reason = cancelReason.trim();
        if (reason.length < 10) {
          setDialogError("La raison d'annulation doit contenir au moins 10 caractères.");
          return;
        }
        await onLifecycleAction(view.tripId, "cancel", reason);
      }
      resetDialogState();
    } catch {
      // erreurs gérées via toast page ; garder la modale ouverte
    }
  }

  useEffect(() => {
    if (!dialogAction) return undefined;
    return () => {
      occupancyRequestRef.current += 1;
    };
  }, [dialogAction]);

  const lifecycleActions = canManageLifecycle
    ? (() => {
        switch (view.lifecycleStatus) {
          case "WAITING":
            return (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => void handleStartBoarding()}
                  isLoading={isLifecyclePending}
                >
                  Démarrer l'embarquement
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => void openActionDialog("cancel")}
                  disabled={isLifecyclePending}
                >
                  Annuler le trajet
                </Button>
              </>
            );
          case "BOARDING":
            return (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => void openActionDialog("depart")}
                  disabled={isLifecyclePending}
                >
                  Départ effectué
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => void openActionDialog("cancel")}
                  disabled={isLifecyclePending}
                >
                  Annuler le trajet
                </Button>
              </>
            );
          case "DEPARTED":
            return (
              <Button
                size="sm"
                variant="primary"
                onClick={() => void openActionDialog("complete")}
                disabled={isLifecyclePending}
              >
                Trajet terminé
              </Button>
            );
          default:
            return null;
        }
      })()
    : null;

  return (
    <>
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
            <TripLifecycleBadge status={view.lifecycleStatus} />
            <DepartureReadinessBadge status={view.readiness} size="lg" className="opacity-90" />
          </div>
        </div>

        {view.boardingComplete ? (
          <p className="mb-3 text-sm font-semibold text-primary">Boarding complete</p>
        ) : null}

        <BoardingProgressBar percent={view.percentBoarded} className="mb-4" />
        <p className="mb-3 text-xs text-muted-foreground">
          Readiness (secondaire) : Occupés {view.occupiedSeats} / Embarqués {view.boardedCount} / Restants{" "}
          {view.remainingBoardingCount}
        </p>

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

        {view.incidents.length > 0 || promotedForTrip.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {view.incidents.map((incident) => (
              <DepartureIncidentBadge key={incident.id} incident={incident} />
            ))}
            {promotedForTrip.map((incident) => (
              <PromotedIncidentBadge key={incident.id} incident={incident} />
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {lifecycleActions}
          {canPromote ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => onPromote?.(view)}>
              Promouvoir
            </Button>
          ) : null}
          <Link
            to={`${ROUTES.incidents}?tripId=${encodeURIComponent(view.tripId)}&category=departure&create=1`}
            className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted/30"
          >
            Signaler incident
          </Link>
        </div>
      </article>

      <TripLifecycleActionDialog
        open={dialogAction !== null}
        action={dialogAction ?? "complete"}
        routeLabel={view.routeLabel}
        departureTime={view.departureTime}
        occupancy={occupancy}
        isLoadingOccupancy={isLoadingOccupancy}
        cancelReason={cancelReason}
        onCancelReasonChange={setCancelReason}
        cancelSeverityClass={cancelSeverityClass}
        absents={absents}
        errorMessage={dialogError}
        isSubmitting={isLifecyclePending}
        onClose={resetDialogState}
        onConfirm={() => void submitDialogAction()}
      />
    </>
  );
}
