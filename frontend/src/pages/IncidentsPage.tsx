import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError } from "@/api/http";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { CriticalIncidentsSection } from "@/features/incidents/components/CriticalIncidentsSection";
import { IncidentCreateForm } from "@/features/incidents/components/IncidentCreateForm";
import { IncidentFilters } from "@/features/incidents/components/IncidentFilters";
import { IncidentKpiGrid } from "@/features/incidents/components/IncidentKpiGrid";
import { IncidentResolveDialog } from "@/features/incidents/components/IncidentResolveDialog";
import { IncidentToast } from "@/features/incidents/components/IncidentToast";
import { IncidentsList } from "@/features/incidents/components/IncidentsList";
import { LocalIncidentsImportBanner } from "@/features/incidents/components/LocalIncidentsImportBanner";
import { OperationalActionsPanel } from "@/features/incidents/components/OperationalActionsPanel";
import { useIncidentTripMap } from "@/features/incidents/hooks/useIncidentTripMap";
import { useIncidentsList, useIncidentsOperations } from "@/features/incidents/hooks/useIncidents";
import { clearLegacyLocalIncidents } from "@/features/incidents/storage/incidents-storage";
import { filterIncidents } from "@/features/incidents/utils/filter-incidents";
import { computeIncidentKpis } from "@/features/incidents/utils/incident-kpis";
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

function parseInitialFilters(searchParams: URLSearchParams): IncidentFiltersState {
  const filters: IncidentFiltersState = { ...DEFAULT_INCIDENT_FILTERS };

  if (searchParams.get("openOnly") === "1" || searchParams.get("status") === "active") {
    filters.status = "active";
  }

  const severity = searchParams.get("severity");
  if (severity === "CRITICAL" || searchParams.get("filter") === "critical") {
    filters.severity = "CRITICAL";
    filters.status = "active";
  }

  const source = searchParams.get("source");
  if (source) {
    filters.source = source as IncidentFiltersState["source"];
  }

  const tripId = searchParams.get("tripId");
  if (tripId) {
    filters.tripSearch = tripId;
  }

  const q = searchParams.get("q");
  if (q) filters.searchText = q;

  return filters;
}

export function IncidentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const listQuery = useIncidentsList({ limit: 100, offset: 0 });
  const {
    toastMessage,
    dismissToast,
    createIncident,
    resolveIncident,
    assignIncident,
    clearResolvedIncidents,
    importLocal,
    isCreating,
    isResolving,
    isAssigning,
    resolveError,
    isImporting,
  } = useIncidentsOperations();

  const { tripById } = useIncidentTripMap();
  const [resolveTargetId, setResolveTargetId] = useState<string | null>(null);
  const highlightId = searchParams.get("incidentId");

  const [showCreateForm, setShowCreateForm] = useState(
    () => searchParams.get("create") === "1"
  );
  const [filters, setFilters] = useState<IncidentFiltersState>(() =>
    parseInitialFilters(searchParams)
  );

  const initialTripId = searchParams.get("tripId") ?? "";
  const initialType = mapCategoryToType(searchParams.get("category"));

  useEffect(() => {
    if (searchParams.get("create") === "1") setShowCreateForm(true);
  }, [searchParams]);

  useEffect(() => {
    if (!highlightId || listQuery.isLoading) return;
    const timer = window.setTimeout(() => {
      document
        .querySelector(`[data-incident-id="${highlightId}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [highlightId, listQuery.isLoading, listQuery.dataUpdatedAt]);

  const incidents = useMemo(() => listQuery.data?.incidents ?? [], [listQuery.data?.incidents]);
  const kpis = useMemo(() => computeIncidentKpis(incidents), [incidents]);

  const filteredIncidents = useMemo(
    () => filterIncidents(incidents, filters, tripById),
    [incidents, filters, tripById]
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

  function handleResolve(incidentId: string) {
    setResolveTargetId(incidentId);
  }

  async function handleResolveSubmit(resolution: string) {
    if (!resolveTargetId) return;
    try {
      await resolveIncident(resolveTargetId, resolution);
      setResolveTargetId(null);
    } catch {
      // error surfaced via resolveError
    }
  }

  async function handleAssign(incidentId: string, userId: string | null) {
    await assignIncident(incidentId, userId);
  }

  const resolveTarget = resolveTargetId
    ? incidents.find((item) => item.id === resolveTargetId) ?? null
    : null;

  const resolveErrorMessage =
    resolveError instanceof ApiError
      ? resolveError.code === "RESOLUTION_REQUIRED"
        ? "La note de résolution doit contenir au moins 10 caractères."
        : resolveError.message
      : resolveError
        ? "Impossible de résoudre l'incident."
        : null;

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
    setFilters((current) => ({ ...current, severity: "CRITICAL", status: "active" }));
  }

  const hasAnyIncidents = filteredIncidents.length > 0;

  return (
    <>
      <PageHeader
        title="Incidents"
        description="Centre opérationnel — filtrage, affectation, résolution et clôture"
      />

      <IncidentKpiGrid kpis={kpis} />

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
          title="Aucun incident pour ces filtres"
          description="Ajustez les filtres ou créez un incident depuis cette page, le monitoring ou les départs."
        />
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && hasAnyIncidents ? (
        <>
          <CriticalIncidentsSection
            incidents={criticalOpen}
            tripById={tripById}
            highlightId={highlightId}
            onResolve={handleResolve}
            onAssign={handleAssign}
            isAssigning={isAssigning}
          />
          <IncidentsList
            incidents={others}
            tripById={tripById}
            highlightId={highlightId}
            onResolve={handleResolve}
            onAssign={handleAssign}
            isAssigning={isAssigning}
          />
        </>
      ) : null}

      <IncidentToast message={toastMessage} onDismiss={dismissToast} />

      <IncidentResolveDialog
        incident={resolveTarget}
        trip={
          resolveTarget?.relatedTripId
            ? tripById.get(resolveTarget.relatedTripId)
            : undefined
        }
        open={resolveTargetId !== null}
        isSubmitting={isResolving}
        errorMessage={resolveErrorMessage}
        onClose={() => setResolveTargetId(null)}
        onSubmit={handleResolveSubmit}
      />
    </>
  );
}
