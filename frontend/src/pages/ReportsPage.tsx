import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ApiError } from "@/api/http";
import {
  fetchOperationsIncidentsReport,
  fetchOperationsOverview,
  fetchOperationsRevenueReport,
  fetchOperationsTripsReport,
} from "@/api/admin-reports.api";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { queryKeys } from "@/constants/query-keys";
import {
  DashboardWidget,
} from "@/features/dashboard/components/DashboardWidget";
import { ReportsExportsPanel } from "@/features/reports/components/ReportsExportsPanel";
import {
  ReportsIncidentsFilters,
  ReportsIncidentsTable,
} from "@/features/reports/components/ReportsIncidentsSection";
import { ReportsKpiOverview } from "@/features/reports/components/ReportsKpiOverview";
import { ReportsPeriodBar } from "@/features/reports/components/ReportsPeriodBar";
import { ReportsRevenueSection } from "@/features/reports/components/ReportsRevenueSection";
import {
  ReportsTripsFilters,
  ReportsTripsTable,
} from "@/features/reports/components/ReportsTripsSection";
import { DEFAULT_REPORTS_PERIOD } from "@/features/reports/utils/reports-period";
import type {
  ReportsIncidentsFilters as ReportsIncidentsFiltersState,
  ReportsPeriodState,
  ReportsTripsFilters as ReportsTripsFiltersState,
} from "@/types/reports.types";
import type { TripLifecycleStatus } from "@/types/trips.types";
import type { IncidentSeverity, IncidentStatus, IncidentType } from "@/types/incidents.types";

const REPORTS_STALE_MS = 30_000;
const TRIPS_PAGE_SIZE = 50;
const INCIDENTS_PAGE_SIZE = 50;

export function ReportsPage() {
  const [period, setPeriod] = useState<ReportsPeriodState>(DEFAULT_REPORTS_PERIOD);
  const [tripsFilters, setTripsFilters] = useState<ReportsTripsFiltersState>({
    limit: TRIPS_PAGE_SIZE,
    offset: 0,
  });
  const [incidentsFilters, setIncidentsFilters] = useState<ReportsIncidentsFiltersState>({
    limit: INCIDENTS_PAGE_SIZE,
    offset: 0,
  });

  const periodKey = useMemo(
    () => ({ from: period.from, to: period.to }),
    [period.from, period.to]
  );

  const overviewQuery = useQuery({
    queryKey: queryKeys.reports.overview(periodKey),
    queryFn: () => fetchOperationsOverview(periodKey),
    staleTime: REPORTS_STALE_MS,
  });

  const tripsQuery = useQuery({
    queryKey: queryKeys.reports.trips({ ...periodKey, ...tripsFilters }),
    queryFn: () => fetchOperationsTripsReport(periodKey, tripsFilters),
    staleTime: REPORTS_STALE_MS,
  });

  const incidentsQuery = useQuery({
    queryKey: queryKeys.reports.incidents({ ...periodKey, ...incidentsFilters }),
    queryFn: () => fetchOperationsIncidentsReport(periodKey, incidentsFilters),
    staleTime: REPORTS_STALE_MS,
  });

  const revenueQuery = useQuery({
    queryKey: queryKeys.reports.revenue(periodKey),
    queryFn: () => fetchOperationsRevenueReport(periodKey),
    staleTime: REPORTS_STALE_MS,
  });

  const isInitialLoading =
    overviewQuery.isLoading && tripsQuery.isLoading && incidentsQuery.isLoading;

  const hasGlobalError =
    overviewQuery.isError && tripsQuery.isError && incidentsQuery.isError;

  const tripsTotalPages = tripsQuery.data
    ? Math.max(1, Math.ceil(tripsQuery.data.pagination.total / tripsFilters.limit))
    : 1;
  const tripsPage = Math.floor(tripsFilters.offset / tripsFilters.limit) + 1;

  const incidentsTotalPages = incidentsQuery.data
    ? Math.max(1, Math.ceil(incidentsQuery.data.pagination.total / incidentsFilters.limit))
    : 1;
  const incidentsPage = Math.floor(incidentsFilters.offset / incidentsFilters.limit) + 1;

  function resetPaginationOnPeriodChange(next: ReportsPeriodState) {
    setPeriod(next);
    setTripsFilters((f) => ({ ...f, offset: 0 }));
    setIncidentsFilters((f) => ({ ...f, offset: 0 }));
  }

  return (
    <>
      <PageHeader
        title="Rapports"
        description="Cockpit reporting exploitation — synthèse, tableaux et exports CSV"
      />

      <ReportsPeriodBar period={period} onChange={resetPaginationOnPeriodChange} />

      {overviewQuery.data?.meta.limitations.length ? (
        <div className="mb-4 rounded-lg border border-border bg-muted/15 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Limitations connues</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {overviewQuery.data.meta.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasGlobalError ? (
        <ErrorState
          message={
            overviewQuery.error instanceof ApiError
              ? overviewQuery.error.message
              : "Impossible de charger les rapports"
          }
          onRetry={() => {
            overviewQuery.refetch();
            tripsQuery.refetch();
            incidentsQuery.refetch();
            revenueQuery.refetch();
          }}
        />
      ) : null}

      {!hasGlobalError ? (
        <>
          <div className="mb-8">
            <ReportsKpiOverview
              overview={overviewQuery.data}
              isLoading={overviewQuery.isLoading}
            />
            {overviewQuery.isError ? (
              <ErrorState
                message={
                  overviewQuery.error instanceof ApiError
                    ? overviewQuery.error.message
                    : "Synthèse indisponible"
                }
                onRetry={() => overviewQuery.refetch()}
              />
            ) : null}
          </div>

          <div className="mb-8 space-y-4">
            <DashboardWidget title="Trajets" description="Détail opérationnel par départ">
              <ReportsTripsFilters
                lifecycleStatus={tripsFilters.lifecycleStatus}
                onLifecycleChange={(lifecycleStatus: TripLifecycleStatus | undefined) =>
                  setTripsFilters((f) => ({ ...f, lifecycleStatus, offset: 0 }))
                }
              />
              {tripsQuery.isLoading ? <TableSkeleton /> : null}
              {tripsQuery.isError ? (
                <ErrorState
                  message={
                    tripsQuery.error instanceof ApiError
                      ? tripsQuery.error.message
                      : "Tableau trajets indisponible"
                  }
                  onRetry={() => tripsQuery.refetch()}
                />
              ) : null}
              {!tripsQuery.isLoading &&
              !tripsQuery.isError &&
              (tripsQuery.data?.trips.length ?? 0) === 0 ? (
                <EmptyState
                  badge="Aucun trajet"
                  title="Aucun trajet sur cette période"
                  description="Élargissez la fenêtre temporelle ou modifiez le filtre lifecycle."
                />
              ) : null}
              {!tripsQuery.isLoading &&
              !tripsQuery.isError &&
              (tripsQuery.data?.trips.length ?? 0) > 0 ? (
                <>
                  <ReportsTripsTable rows={tripsQuery.data!.trips} />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                      {tripsQuery.data!.pagination.total} trajet(s) · page {tripsPage} /{" "}
                      {tripsTotalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={tripsFilters.offset <= 0}
                        onClick={() =>
                          setTripsFilters((f) => ({
                            ...f,
                            offset: Math.max(0, f.offset - f.limit),
                          }))
                        }
                      >
                        Précédent
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={tripsPage >= tripsTotalPages}
                        onClick={() =>
                          setTripsFilters((f) => ({
                            ...f,
                            offset: f.offset + f.limit,
                          }))
                        }
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}
            </DashboardWidget>
          </div>

          <div className="mb-8 space-y-4">
            <DashboardWidget
              title="Incidents"
              description={
                incidentsQuery.data
                  ? `${incidentsQuery.data.aggregation.total} incident(s) · ${incidentsQuery.data.aggregation.critical} critique(s)`
                  : "Incidents survenus pendant la période"
              }
            >
              <ReportsIncidentsFilters
                status={incidentsFilters.status}
                type={incidentsFilters.type}
                severity={incidentsFilters.severity}
                onStatusChange={(status: IncidentStatus | undefined) =>
                  setIncidentsFilters((f) => ({ ...f, status, offset: 0 }))
                }
                onTypeChange={(type: IncidentType | undefined) =>
                  setIncidentsFilters((f) => ({ ...f, type, offset: 0 }))
                }
                onSeverityChange={(severity: IncidentSeverity | undefined) =>
                  setIncidentsFilters((f) => ({ ...f, severity, offset: 0 }))
                }
              />
              {incidentsQuery.isLoading ? <TableSkeleton /> : null}
              {incidentsQuery.isError ? (
                <ErrorState
                  message={
                    incidentsQuery.error instanceof ApiError
                      ? incidentsQuery.error.message
                      : "Tableau incidents indisponible"
                  }
                  onRetry={() => incidentsQuery.refetch()}
                />
              ) : null}
              {!incidentsQuery.isLoading &&
              !incidentsQuery.isError &&
              (incidentsQuery.data?.incidents.length ?? 0) === 0 ? (
                <EmptyState
                  badge="Aucun incident"
                  title="Aucun incident sur cette période"
                  description="Aucun incident ne correspond aux filtres sélectionnés."
                />
              ) : null}
              {!incidentsQuery.isLoading &&
              !incidentsQuery.isError &&
              (incidentsQuery.data?.incidents.length ?? 0) > 0 ? (
                <>
                  <ReportsIncidentsTable rows={incidentsQuery.data!.incidents} />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                      {incidentsQuery.data!.pagination.total} incident(s) · page {incidentsPage} /{" "}
                      {incidentsTotalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={incidentsFilters.offset <= 0}
                        onClick={() =>
                          setIncidentsFilters((f) => ({
                            ...f,
                            offset: Math.max(0, f.offset - f.limit),
                          }))
                        }
                      >
                        Précédent
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={incidentsPage >= incidentsTotalPages}
                        onClick={() =>
                          setIncidentsFilters((f) => ({
                            ...f,
                            offset: f.offset + f.limit,
                          }))
                        }
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}
            </DashboardWidget>
          </div>

          <div className="mb-8">
            <ReportsRevenueSection
              revenue={revenueQuery.data}
              overview={overviewQuery.data}
              isLoading={revenueQuery.isLoading}
            />
            {revenueQuery.isError ? (
              <ErrorState
                message={
                  revenueQuery.error instanceof ApiError
                    ? revenueQuery.error.message
                    : "Recettes indisponibles"
                }
                onRetry={() => revenueQuery.refetch()}
              />
            ) : null}
          </div>

          <ReportsExportsPanel
            period={periodKey}
            generatedAt={overviewQuery.data?.meta.generatedAt}
          />
        </>
      ) : null}

      {isInitialLoading && !hasGlobalError ? (
        <p className="sr-only">Chargement des rapports…</p>
      ) : null}
    </>
  );
}
