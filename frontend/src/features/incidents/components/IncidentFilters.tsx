import type { IncidentFiltersState, IncidentCategory, IncidentSeverity } from "@/types/incidents.types";
import { INCIDENT_CATEGORY_LABELS } from "@/features/incidents/constants/incident-category-labels";

export interface IncidentFiltersProps {
  filters: IncidentFiltersState;
  onChange: (filters: IncidentFiltersState) => void;
}

const selectClassName =
  "flex h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function IncidentFilters({ filters, onChange }: IncidentFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/20 p-3">
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
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="filter-category" className="text-xs font-medium text-muted-foreground">
          Catégorie
        </label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(event) =>
            onChange({ ...filters, category: event.target.value as IncidentCategory | "all" })
          }
          className={selectClassName}
        >
          <option value="all">Toutes</option>
          {Object.entries(INCIDENT_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
