import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { mapDependencyCheck } from "@/api/system.api";
import { relativeTime } from "@/lib/relativeTime";
import { HealthStatusBadge } from "@/features/monitoring/components/HealthStatusBadge";
import {
  DashboardWidget,
  DashboardWidgetEmpty,
  DashboardWidgetLoading,
} from "@/features/dashboard/components/DashboardWidget";
import type { MonitoringSnapshot } from "@/types/system.types";

export function DashboardMonitoringCard({
  snapshot,
  isLoading,
}: {
  snapshot: MonitoringSnapshot | undefined;
  isLoading: boolean;
}) {
  const readiness = snapshot?.readiness;
  const checks = readiness?.data?.checks;

  return (
    <DashboardWidget
      title="Monitoring / System Health"
      description="Polling 30s — pas de WebSocket"
      tone={
        snapshot && (snapshot.health.status !== "ok" || snapshot.readiness.status !== "ok")
          ? "warning"
          : "default"
      }
      actions={
        <Link to={ROUTES.monitoring} className="text-xs font-medium text-primary hover:underline">
          Console monitoring
        </Link>
      }
    >
      {isLoading && !snapshot ? (
        <DashboardWidgetLoading />
      ) : !snapshot ? (
        <DashboardWidgetEmpty message="Monitoring indisponible." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-border bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">API READY</p>
            <div className="mt-1">
              <HealthStatusBadge status={readiness?.status ?? "unknown"} size="sm" />
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Database</p>
            <div className="mt-1">
              <HealthStatusBadge
                status={mapDependencyCheck(checks?.database?.status)}
                size="sm"
              />
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Stripe (config)</p>
            <div className="mt-1">
              <HealthStatusBadge status={mapDependencyCheck(checks?.stripe?.status)} size="sm" />
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Mode</p>
            <p className="mt-1 text-sm font-medium text-foreground">Polling 30s</p>
            <p className="text-[11px] text-muted-foreground">
              MAJ {relativeTime(snapshot.fetchedAt)}
            </p>
          </div>
        </div>
      )}
    </DashboardWidget>
  );
}
