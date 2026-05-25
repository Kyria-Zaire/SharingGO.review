import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError } from "@/api/http";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { CriticalIncidentsSection } from "@/features/incidents/components/CriticalIncidentsSection";
import { IncidentCreateForm } from "@/features/incidents/components/IncidentCreateForm";
import { IncidentFilters } from "@/features/incidents/components/IncidentFilters";
import { IncidentToast } from "@/features/incidents/components/IncidentToast";
import { IncidentsList } from "@/features/incidents/components/IncidentsList";
import { LocalIncidentsImportBanner } from "@/features/incidents/components/LocalIncidentsImportBanner";
import { OperationalActionsPanel } from "@/features/incidents/components/OperationalActionsPanel";
import { useIncidentsList, useIncidentsOperations } from "@/features/incidents/hooks/useIncidents";
import { clearLegacyLocalIncidents } from "@/features/incidents/storage/incidents-storage";
import { filterIncidents } from "@/features/incidents/utils/filter-incidents";
import { partitionCriticalOpen } from "@/features/incidents/utils/sort-incidents";
import type { IncidentFiltersState, IncidentType } from "@/types/incidents.types";
import { DEFAULT_INCIDENT_FILTERS } from "@/types/incidents.types";

function mapCategoryToType(category: string | null): IncidentType {
  switch (category) {
    case "departure":
      return "DELAY";
    case "boarding":
    case "capacity":
      return "BEHAVIOR";
    case "system":
    case "payment":
      return "TECHNICAL";
    default:
      return "OTHER";
  }
}

export function IncidentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const listQuery = useIncidentsList({ limit: 100, offset: 0 });
  const {
    toastMessage,
    dismissToast,
    createIncident,
    resolveIncident,
    clearResolvedIncidents,
    importLocal,
    isCreating,
    isImporting,
  } = useIncidentsOperations();

  const [showCreateForm, setShowCreateForm] = useState(
    () => searchParams.get("create") === "1"
  );
  const [filters, setFilters] = useState<IncidentFiltersState>(() => ({
    ...DEFAULT_INCIDENT_FILTERS,
    openOnly: searchParams.get("openOnly") === "1",
    severity:
      searchParams.get("severity") === "critical" || searchParams.get("filter") === "critical"
        ? "CRITICAL"
        : "all",
    type: "all",
  }));

  const initialTripId = searchParams.get("tripId") ?? "";
  const initialType = mapCategoryToType(searchParams.get("category"));

  useEffect(() => {
    if (searchParams.get("create") === "1") setShowCreateForm(true);
  }, [searchParams]);

  const incidents = useMemo(() => listQuery.data?.incidents ?? [], [listQuery.data?.incidents]);

  const filteredIncidents = useMemo(
    () => filterIncidents(incidents, filters),
    [incidents, filters]
  );

  const { criticalOpen, others } = useMemo(
    () => partitionCriticalOpen(filteredIncidents),
    [filteredIncidents]
  );

  async function handleCreate(input: Parameters<typeof createIncident>[0]) {
    await createIncident(input);
    setShowCreateForm(false);
    setSearchParams({});
  }

  async function handleResolve(incidentId: string) {
    const incident = incidents.find((item) => item.id === incidentId);
    if (!incident) return;
    const confirmed = window.confirm(`Résoudre l'incident ${incident.code} ?`);
    if (confirmed) await resolveIncident(incidentId);
  }

  async function handleClearResolved() {
    const resolvedIds = incidents
      .filter((incident) => incident.status === "RESOLVED")
      .map((incident) => incident.id);
    await clearResolvedIncidents(resolvedIds);
  }

  async function handleImportLocal(payload: Parameters<typeof importLocal>[0]) {
    await importLocal(payload);
    clearLegacyLocalIncidents();
  }

  function handleFilterCritical() {
    setFilters((current) => ({ ...current, severity: "CRITICAL", openOnly: true }));
  }

  const hasAnyIncidents = filteredIncidents.length > 0;

  return (
    <>
      <PageHeader
        title="Incidents"
        description="Workflow incident opérationnel persisté — partagé entre administrateurs"
      />

      <OperationalActionsPanel
        incidents={incidents}
        onCreateClick={() => setShowCreateForm(true)}
        onFilterCritical={handleFilterCritical}
        onClearResolved={handleClearResolved}
        onRefresh={() => listQuery.refetch()}
        isRefreshing={listQuery.isFetching}
      />

      <LocalIncidentsImportBanner onImport={handleImportLocal} isImporting={isImporting} />

      <div className="mb-4">
        <IncidentFilters filters={filters} onChange={setFilters} />
      </div>

      {listQuery.isError ? (
        <ErrorState
          message={
            listQuery.error instanceof ApiError
              ? listQuery.error.message
              : "Impossible de charger les incidents"
          }
          onRetry={() => listQuery.refetch()}
        />
      ) : null}

      {showCreateForm ? (
        <div className="mb-6">
          <IncidentCreateForm
            initialType={initialType}
            initialTripId={initialTripId}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={isCreating}
          />
        </div>
      ) : null}

      {listQuery.isLoading ? (
        <p className="mb-4 text-sm text-muted-foreground">Chargement des incidents…</p>
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && !hasAnyIncidents ? (
        <EmptyState
          badge="Aucun incident"
          title="Aucun incident opérationnel"
          description="Créez un incident depuis cette page, le monitoring ou les départs."
        />
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && hasAnyIncidents ? (
        <>
          <CriticalIncidentsSection incidents={criticalOpen} onResolve={handleResolve} />
          <IncidentsList incidents={others} onResolve={handleResolve} />
        </>
      ) : null}

      <IncidentToast message={toastMessage} onDismiss={dismissToast} />
    </>
  );
}
