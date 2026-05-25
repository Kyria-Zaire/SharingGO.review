import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { DASHBOARD_REFRESH_COOLDOWN_MS } from "@/features/dashboard/constants/dashboard";
import { DashboardActiveOperations } from "@/features/dashboard/components/DashboardActiveOperations";
import { DashboardActivityPreview } from "@/features/dashboard/components/DashboardActivityPreview";
import { DashboardAttentionPanel } from "@/features/dashboard/components/DashboardAttentionPanel";
import { DashboardDispatchSummary } from "@/features/dashboard/components/DashboardDispatchSummary";
import { DashboardKpiGrid } from "@/features/dashboard/components/DashboardKpiGrid";
import { DashboardMonitoringCard } from "@/features/dashboard/components/DashboardMonitoringCard";
import { DashboardQuickActions } from "@/features/dashboard/components/DashboardQuickActions";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { relativeTime } from "@/lib/relativeTime";

export function DashboardPage() {
  const [refreshCooldown, setRefreshCooldown] = useState(false);
  const [lastManualRefresh, setLastManualRefresh] = useState<Date | null>(null);

  const data = useDashboardData(!refreshCooldown);

  const handleRefresh = () => {
    if (refreshCooldown) return;
    setRefreshCooldown(true);
    void data.refetchAll().finally(() => {
      setLastManualRefresh(new Date());
      window.setTimeout(() => setRefreshCooldown(false), DASHBOARD_REFRESH_COOLDOWN_MS);
    });
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Centre de pilotage opérationnel — dispatch-first, polling 30s"
        actions={
          <div className="flex flex-col items-end gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshCooldown || data.isFetching}
              isLoading={data.isFetching}
            >
              <RefreshCw className="h-4 w-4" />
              Rafraîchir
            </Button>
            {data.isFetching && !data.isLoading ? (
              <span className="text-xs text-muted-foreground">Mise à jour…</span>
            ) : null}
            {lastManualRefresh ? (
              <span className="text-xs text-muted-foreground">
                Refresh manuel {relativeTime(lastManualRefresh)}
              </span>
            ) : null}
          </div>
        }
      />

      <div className="mb-4">
        <DashboardQuickActions
          onRefresh={handleRefresh}
          refreshDisabled={refreshCooldown}
          isRefreshing={data.isFetching}
        />
      </div>

      <div className="space-y-4">
        <DashboardDispatchSummary
          criticalOpenCount={data.sticky.criticalOpenCount}
          nearDepartureCount={data.sticky.nearDepartureCount}
          activeBoardingCount={data.sticky.activeBoardingCount}
          tripsFullCount={data.tripsFullCount}
          monitoringWarningCount={data.monitoringWarningCount}
          isLoading={data.isLoading}
        />

        <DashboardAttentionPanel items={data.attentionItems} isLoading={data.isLoading} />

        <DashboardActiveOperations
          boardingTrips={data.boardingTrips}
          nearDepartures={data.nearDepartures}
          criticalIncidents={data.criticalIncidents}
          isLoading={data.isLoading}
        />

        <DashboardKpiGrid kpis={data.kpis} isLoading={data.isLoading} />

        <DashboardActivityPreview events={data.activityEvents} isLoading={data.isLoading} />

        <DashboardMonitoringCard snapshot={data.monitoring} isLoading={data.isLoading} />
      </div>
    </>
  );
}
