import {
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_TYPE_LABELS,
} from "@/features/incidents/constants/incident-labels";
import type { IncidentFiltersState, IncidentSeverity, IncidentType } from "@/types/incidents.types";

const selectClassName =
  "flex h-10 w-full min-w-0 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-9 sm:w-auto sm:min-w-[10rem]";

export function IncidentFilters({
  filters,
  onChange,
}: {
  filters: IncidentFiltersState;
  onChange: (filters: IncidentFiltersState) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={filters.openOnly}
          onChange={(event) => onChange({ ...filters, openOnly: event.target.checked })}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        Open only
      </label>
      <div className="space-y-1">
        <label htmlFor="filter-severity" className="text-xs font-medium text-muted-foreground">
          Sévérité
        </label>
        <select
          id="filter-severity"
          value={filters.severity}
          onChange={(event) =>
            onChange({ ...filters, severity: event.target.value as IncidentSeverity | "all" })
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
    </div>
  );
}
