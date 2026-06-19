import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchMonitoringSnapshot } from "@/api/system.api";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { MonitoringLastUpdated } from "@/features/monitoring/components/MonitoringLastUpdated";
import { MonitoringUnavailableCard } from "@/features/monitoring/components/MonitoringUnavailableCard";
import { OfflineModeCard } from "@/features/monitoring/components/OfflineModeCard";
import { OpsRunbooksCard } from "@/features/monitoring/components/OpsRunbooksCard";
import { ReadinessChecksCard } from "@/features/monitoring/components/ReadinessChecksCard";
import { SystemHealthCard } from "@/features/monitoring/components/SystemHealthCard";
import type { MonitoringStatus, OfflineProbeResult } from "@/types/system.types";

const MONITORING_STALE_TIME_MS = 30_000;
const REFRESH_COOLDOWN_MS = 2_000;
const DELAYED_MESSAGE_MS = 6_000;

function resolveOfflineStatus(probe: OfflineProbeResult): MonitoringStatus {
  if (!probe.data) return "unknown";
  if (!probe.data.offlineValidation.supported) return "warning";
  return "ok";
}

function isMonitoringUnavailable(
  healthStatus: MonitoringStatus,
  readinessStatus: MonitoringStatus
): boolean {
  return healthStatus === "unknown" && readinessStatus === "unknown";
}

export function MonitoringPage() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshCooldown, setRefreshCooldown] = useState(false);
  const [showDelayed, setShowDelayed] = useState(false);

  const monitoringQuery = useQuery({
    queryKey: queryKeys.monitoring.snapshot,
    queryFn: fetchMonitoringSnapshot,
    staleTime: MONITORING_STALE_TIME_MS,
  });

  const isFetching = monitoringQuery.isFetching;

  useEffect(() => {
    if (!isFetching) {
      setShowDelayed(false);
      return;
    }
    const timer = setTimeout(() => setShowDelayed(true), DELAYED_MESSAGE_MS);
    return () => clearTimeout(timer);
  }, [isFetching]);

  useEffect(() => {
    if (monitoringQuery.isSuccess || monitoringQuery.isError) {
      setLastUpdated(new Date());
    }
  }, [monitoringQuery.dataUpdatedAt, monitoringQuery.isSuccess, monitoringQuery.isError]);

  function handleRefresh() {
    if (refreshCooldown) return;
    setRefreshCooldown(true);
    void monitoringQuery.refetch().finally(() => {
      setLastUpdated(new Date());
      setTimeout(() => setRefreshCooldown(false), REFRESH_COOLDOWN_MS);
    });
  }

  const snapshot = monitoringQuery.data;
  const unavailable =
    snapshot !== undefined &&
    isMonitoringUnavailable(snapshot.health.status, snapshot.readiness.status);

  const offlineStatus = snapshot ? resolveOfflineStatus(snapshot.offline) : "unknown";

  return (
    <>
      <PageHeader
        title="Monitoring"
        description="Santé API, readiness et manifest boarding — cockpit fiabilité"
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <MonitoringLastUpdated at={lastUpdated} />
          {showDelayed && isFetching ? (
            <p className="text-sm font-medium text-warning">Monitoring response delayed</p>
          ) : null}
          {monitoringQuery.isFetching && !showDelayed ? (
            <p className="text-sm text-muted-foreground">Actualisation des sondes…</p>
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            to={`${ROUTES.incidents}?category=system&create=1`}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-muted px-3 text-xs font-medium text-foreground hover:bg-muted/80 sm:h-8 sm:w-auto"
          >
            <AlertTriangle className="h-4 w-4" />
            Créer incident système
          </Link>
          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleRefresh}
            disabled={refreshCooldown || monitoringQuery.isFetching}
            isLoading={monitoringQuery.isFetching}
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {unavailable ? (
        <div className="mb-6">
          <MonitoringUnavailableCard
            onRetry={handleRefresh}
            isRetrying={monitoringQuery.isFetching}
          />
        </div>
      ) : null}

      {snapshot && !unavailable ? (
        <div className="mb-6 grid min-w-0 max-w-full gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ReadinessChecksCard probe={snapshot.readiness} offlineStatus={offlineStatus} />
          </div>
          <div className="space-y-4">
            <SystemHealthCard probe={snapshot.health} />
            <OfflineModeCard
              probe={{
                ...snapshot.offline,
                status: offlineStatus,
              }}
            />
          </div>
        </div>
      ) : null}

      {monitoringQuery.isLoading && !snapshot ? (
        <p className="mb-6 text-sm text-muted-foreground">Chargement du monitoring…</p>
      ) : null}

      <OpsRunbooksCard />
    </>
  );
}
