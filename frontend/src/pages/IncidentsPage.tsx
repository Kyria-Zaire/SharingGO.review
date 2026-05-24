import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { CriticalIncidentsSection } from "@/features/incidents/components/CriticalIncidentsSection";
import { IncidentCreateForm } from "@/features/incidents/components/IncidentCreateForm";
import { IncidentFilters } from "@/features/incidents/components/IncidentFilters";
import { IncidentToast } from "@/features/incidents/components/IncidentToast";
import { IncidentsList } from "@/features/incidents/components/IncidentsList";
import { OperationalActionsPanel } from "@/features/incidents/components/OperationalActionsPanel";
import { useOperationalIncidents } from "@/features/incidents/hooks/useOperationalIncidents";
import { filterIncidents } from "@/features/incidents/utils/filter-incidents";
import { partitionCriticalOpen } from "@/features/incidents/utils/sort-incidents";
import type {
  CreateOperationalIncidentInput,
  IncidentCategory,
  IncidentFiltersState,
} from "@/types/incidents.types";
import { DEFAULT_INCIDENT_FILTERS as DEFAULT_FILTERS } from "@/types/incidents.types";

function parseCategory(value: string | null): IncidentCategory | undefined {
  const allowed = ["boarding", "departure", "capacity", "payment", "system", "other"] as const;
  return allowed.includes(value as IncidentCategory) ? (value as IncidentCategory) : undefined;
}

export function IncidentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    incidents,
    openCount,
    toastMessage,
    dismissToast,
    createIncident,
    resolveIncident,
    clearResolvedIncidents,
  } = useOperationalIncidents();

  const [showCreateForm, setShowCreateForm] = useState(
    () => searchParams.get("create") === "1"
  );
  const [filters, setFilters] = useState<IncidentFiltersState>(() => ({
    ...DEFAULT_FILTERS,
    openOnly: searchParams.get("openOnly") === "1",
    severity:
      searchParams.get("severity") === "critical"
        ? "critical"
        : searchParams.get("filter") === "critical"
          ? "critical"
          : "all",
    category: parseCategory(searchParams.get("category")) ?? "all",
  }));

  const initialTripId = searchParams.get("tripId") ?? "";
  const initialCategory = parseCategory(searchParams.get("category")) ?? "other";

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setShowCreateForm(true);
    }
  }, [searchParams]);

  const filteredIncidents = useMemo(
    () => filterIncidents(incidents, filters),
    [incidents, filters]
  );

  const { criticalOpen, others } = useMemo(
    () => partitionCriticalOpen(filteredIncidents),
    [filteredIncidents]
  );

  const resolvedCount = incidents.filter((incident) => incident.status === "resolved").length;

  function handleCreate(input: CreateOperationalIncidentInput) {
    createIncident(input);
    setShowCreateForm(false);
    setSearchParams({});
  }

  function handleResolve(incidentId: string) {
    const incident = incidents.find((item) => item.id === incidentId);
    if (!incident) return;
    const confirmed = window.confirm(
      `Résoudre l'incident ${incident.incidentCode} ?`
    );
    if (confirmed) resolveIncident(incidentId);
  }

  function handleFilterCritical() {
    setFilters((current) => ({ ...current, severity: "critical", openOnly: true }));
  }

  const hasAnyIncidents = filteredIncidents.length > 0;

  return (
    <>
      <PageHeader
        title="Incidents"
        description="Workflow incident opérationnel local — signalement et suivi terrain (V1 frontend-only)"
      />

      <OperationalActionsPanel
        openCount={openCount}
        resolvedCount={resolvedCount}
        onCreateClick={() => setShowCreateForm(true)}
        onFilterCritical={handleFilterCritical}
        onClearResolved={clearResolvedIncidents}
      />

      <div className="mb-4">
        <IncidentFilters filters={filters} onChange={setFilters} />
      </div>

      {showCreateForm ? (
        <div className="mb-6">
          <IncidentCreateForm
            initialCategory={initialCategory}
            initialTripId={initialTripId}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      ) : null}

      {!hasAnyIncidents ? (
        <EmptyState
          badge="Aucun incident"
          title="Aucun incident opérationnel"
          description="Créez un incident depuis cette page, le monitoring ou les départs pour démarrer le suivi terrain."
        />
      ) : (
        <>
          <CriticalIncidentsSection incidents={criticalOpen} onResolve={handleResolve} />
          <IncidentsList incidents={others} onResolve={handleResolve} />
        </>
      )}

      <IncidentToast message={toastMessage} onDismiss={dismissToast} />
    </>
  );
}
