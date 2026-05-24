import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminLine, AdminTripsListFilters } from "@/types/trips.types";

export interface TripsFiltersProps {
  filters: AdminTripsListFilters;
  onChange: (filters: AdminTripsListFilters) => void;
  lines: AdminLine[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function TripsFilters({
  filters,
  onChange,
  lines,
  onRefresh,
  isRefreshing,
}: TripsFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label htmlFor="filter-from" className="text-sm font-medium text-foreground">
            Départ après
          </label>
          <input
            id="filter-from"
            type="datetime-local"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={toDatetimeLocalValue(filters.from)}
            onChange={(e) => onChange({ ...filters, from: fromDatetimeLocalValue(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="filter-to" className="text-sm font-medium text-foreground">
            Départ avant
          </label>
          <input
            id="filter-to"
            type="datetime-local"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={toDatetimeLocalValue(filters.to)}
            onChange={(e) => onChange({ ...filters, to: fromDatetimeLocalValue(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="filter-line" className="text-sm font-medium text-foreground">
            Ligne
          </label>
          <select
            id="filter-line"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={filters.lineId ?? ""}
            onChange={(e) =>
              onChange({ ...filters, lineId: e.target.value || undefined })
            }
          >
            <option value="">Toutes les lignes</option>
            {lines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </select>
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
        <Button variant="secondary" size="sm" onClick={onRefresh} isLoading={isRefreshing}>
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>
    </div>
  );
}
