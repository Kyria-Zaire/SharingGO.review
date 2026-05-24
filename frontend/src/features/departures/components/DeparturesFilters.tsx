import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminLine } from "@/types/trips.types";
import type { DepartureFilters, DepartureReadinessStatus } from "@/types/departures.types";

const READINESS_OPTIONS: { value: DepartureReadinessStatus | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "BOARDING_IN_PROGRESS", label: "Boarding en cours" },
  { value: "WAITING_PASSENGERS", label: "En attente passagers" },
  { value: "READY", label: "Ready" },
  { value: "EMPTY", label: "Vide" },
  { value: "UNKNOWN", label: "Unknown" },
];

export interface DeparturesFiltersProps {
  filters: DepartureFilters;
  onChange: (filters: DepartureFilters) => void;
  lines: AdminLine[];
  onRefresh: () => void;
  isRefreshing?: boolean;
  refreshDisabled?: boolean;
}

export function DeparturesFilters({
  filters,
  onChange,
  lines,
  onRefresh,
  isRefreshing,
  refreshDisabled,
}: DeparturesFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label htmlFor="dep-line" className="text-sm font-medium text-foreground">
            Ligne
          </label>
          <select
            id="dep-line"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={filters.lineId ?? ""}
            onChange={(e) => onChange({ ...filters, lineId: e.target.value || undefined })}
          >
            <option value="">Toutes les lignes</option>
            {lines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="dep-readiness" className="text-sm font-medium text-foreground">
            Readiness
          </label>
          <select
            id="dep-readiness"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={filters.readiness ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                readiness: (e.target.value || undefined) as DepartureReadinessStatus | undefined,
              })
            }
          >
            {READINESS_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
              checked={filters.upcomingOnly !== false}
              onChange={(e) => onChange({ ...filters, upcomingOnly: e.target.checked })}
            />
            Trajets à venir uniquement
          </label>
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
              checked={filters.includeDisabled ?? false}
              onChange={(e) =>
                onChange({ ...filters, includeDisabled: e.target.checked || undefined })
              }
            />
            Inclure trajets désactivés
          </label>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          isLoading={isRefreshing}
          disabled={refreshDisabled}
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>
    </div>
  );
}