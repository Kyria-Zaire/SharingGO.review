import {
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_SOURCE_FILTER_OPTIONS,
  INCIDENT_STATUS_FILTER_OPTIONS,
  INCIDENT_TYPE_LABELS,
} from "@/features/incidents/constants/incident-labels";
import type {
  IncidentFiltersState,
  IncidentSeverity,
  IncidentType,
} from "@/types/incidents.types";

const inputClassName =
  "flex h-10 w-full min-w-0 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const selectClassName = `${inputClassName} sm:h-9`;

export function IncidentFilters({
  filters,
  onChange,
}: {
  filters: IncidentFiltersState;
  onChange: (filters: IncidentFiltersState) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="filter-source" className="text-xs font-medium text-muted-foreground">
            Source
          </label>
          <select
            id="filter-source"
            value={filters.source}
            onChange={(event) =>
              onChange({
                ...filters,
                source: event.target.value as IncidentFiltersState["source"],
              })
            }
            className={selectClassName}
          >
            {INCIDENT_SOURCE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="filter-status" className="text-xs font-medium text-muted-foreground">
            Statut
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target.value as IncidentFiltersState["status"],
              })
            }
            className={selectClassName}
          >
            {INCIDENT_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="filter-severity" className="text-xs font-medium text-muted-foreground">
            Sévérité
          </label>
          <select
            id="filter-severity"
            value={filters.severity}
            onChange={(event) =>
              onChange({
                ...filters,
                severity: event.target.value as IncidentSeverity | "all",
              })
            }
            className={selectClassName}
          >
            <option value="all">Toutes</option>
            {(Object.keys(INCIDENT_SEVERITY_LABELS) as IncidentSeverity[]).map((value) => (
              <option key={value} value={value}>
                {INCIDENT_SEVERITY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="filter-type" className="text-xs font-medium text-muted-foreground">
            Type
          </label>
          <select
            id="filter-type"
            value={filters.type}
            onChange={(event) =>
              onChange({ ...filters, type: event.target.value as IncidentType | "all" })
            }
            className={selectClassName}
          >
            <option value="all">Tous</option>
            {(Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[]).map((value) => (
              <option key={value} value={value}>
                {INCIDENT_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
          <label htmlFor="filter-search" className="text-xs font-medium text-muted-foreground">
            Recherche
          </label>
          <input
            id="filter-search"
            type="search"
            value={filters.searchText}
            onChange={(event) => onChange({ ...filters, searchText: event.target.value })}
            placeholder="INC-0004, titre, description…"
            className={inputClassName}
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="filter-trip" className="text-xs font-medium text-muted-foreground">
            Trajet
          </label>
          <input
            id="filter-trip"
            type="search"
            value={filters.tripSearch}
            onChange={(event) => onChange({ ...filters, tripSearch: event.target.value })}
            placeholder="Châlons, Vatry, date, heure…"
            className={inputClassName}
          />
        </div>
      </div>
    </div>
  );
}
