import { Link } from "react-router-dom";
import {
  AlertTriangle,
  PlaneTakeoff,
  QrCode,
  Radio,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { DashboardWidget } from "@/features/dashboard/components/DashboardWidget";

const linkButtonClass =
  "inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function DashboardQuickActions({
  onRefresh,
  refreshDisabled,
  isRefreshing,
}: {
  onRefresh: () => void;
  refreshDisabled: boolean;
  isRefreshing: boolean;
}) {
  return (
    <DashboardWidget title="Quick Actions" description="Raccourcis dispatcher">
      <div className="flex flex-wrap gap-2">
        <Link
          to={ROUTES.boarding}
          className={cn(linkButtonClass, "bg-primary text-primary-foreground hover:bg-primary/90")}
        >
          <QrCode className="h-4 w-4" />
          Boarding
        </Link>
        <Link
          to={ROUTES.dispatch}
          className={cn(
            linkButtonClass,
            "border border-border bg-muted text-foreground hover:bg-muted/80"
          )}
        >
          <Radio className="h-4 w-4" />
          Dispatch
        </Link>
        <Link
          to={`${ROUTES.incidents}?create=1`}
          className={cn(
            linkButtonClass,
            "border border-border bg-muted text-foreground hover:bg-muted/80"
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          Créer incident
        </Link>
        <Link
          to={ROUTES.departures}
          className={cn(
            linkButtonClass,
            "border border-border bg-muted text-foreground hover:bg-muted/80"
          )}
        >
          <PlaneTakeoff className="h-4 w-4" />
          Départs
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={refreshDisabled}
          isLoading={isRefreshing}
        >
          <RefreshCw className="h-4 w-4" />
          Rafraîchir
        </Button>
      </div>
    </DashboardWidget>
  );
}
