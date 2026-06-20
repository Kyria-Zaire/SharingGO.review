import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Filter, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import type { AdminIncident } from "@/types/incidents.types";

export function OperationalActionsPanel({
  incidents,
  onCreateClick,
  onFilterCritical,
  onClearResolved,
  onRefresh,
  isRefreshing = false,
}: {
  incidents: AdminIncident[];
  onCreateClick: () => void;
  onFilterCritical: () => void;
  onClearResolved: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const navigate = useNavigate();
  const openCount = incidents.filter((incident) => isOpenIncidentStatus(incident.status)).length;
  const resolvedIds = incidents
    .filter((incident) => incident.status === "RESOLVED")
    .map((incident) => incident.id);

  function handleClearResolved() {
    if (resolvedIds.length === 0) return;
    const confirmed = window.confirm(
      `Fermer ${resolvedIds.length} incident(s) résolu(s) (status CLOSED) ?`
    );
    if (confirmed) onClearResolved();
  }

  return (
    <section className="mb-6 rounded-lg border border-border bg-muted/20 p-4">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Actions opérationnelles</h2>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onCreateClick}>
          <Plus className="h-4 w-4" />
          Créer incident
        </Button>
        <Link
          to={`${ROUTES.incidents}?status=active`}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-muted px-3 text-xs font-medium text-foreground hover:bg-muted/80"
        >
          <AlertTriangle className="h-4 w-4" />
          Voir ouverts ({openCount})
        </Link>
        <Button variant="secondary" size="sm" onClick={onFilterCritical}>
          <Filter className="h-4 w-4" />
          Filtrer critiques
        </Button>
        <Link
          to={ROUTES.activity}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-muted px-3 text-xs font-medium text-foreground hover:bg-muted/80"
        >
          Activité
        </Link>
        <Link
          to={ROUTES.departures}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-muted px-3 text-xs font-medium text-foreground hover:bg-muted/80"
        >
          Departures
        </Link>
        <Link
          to={ROUTES.boarding}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-muted px-3 text-xs font-medium text-foreground hover:bg-muted/80"
        >
          Boarding
        </Link>
        {onRefresh ? (
          <Button variant="ghost" size="sm" onClick={onRefresh} isLoading={isRefreshing}>
            <RefreshCw className="h-4 w-4" />
            Refresh ops
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.monitoring)}>
            <RefreshCw className="h-4 w-4" />
            Monitoring
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearResolved}
          disabled={resolvedIds.length === 0}
        >
          <Trash2 className="h-4 w-4" />
          Clear resolved
        </Button>
      </div>
    </section>
  );
}
