import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminLine } from "@/types/trips.types";
import type { AdminReservationFilters, ReservationStatus } from "@/types/reservations.types";

const STATUS_OPTIONS: { value: ReservationStatus | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "USED", label: "Utilisée" },
  { value: "PENDING", label: "En attente" },
  { value: "CANCELED", label: "Annulée" },
  { value: "EXPIRED", label: "Expirée" },
];

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

export interface ReservationsFiltersProps {
  filters: AdminReservationFilters;
  onChange: (filters: AdminReservationFilters) => void;
  lines: AdminLine[];
  onRefresh: () => void;
  isRefreshing?: boolean;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  hasNextPage?: boolean;
}

export function ReservationsFilters({
  filters,
  onChange,
  lines,
  onRefresh,
  isRefreshing,
  onPrevPage,
  onNextPage,
  hasNextPage,
}: ReservationsFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label htmlFor="res-status" className="text-sm font-medium text-foreground">
            Statut
          </label>
          <select
            id="res-status"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={filters.status ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                status: (e.target.value || undefined) as ReservationStatus | undefined,
                offset: 0,
              })
            }
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="res-from" className="text-sm font-medium text-foreground">
            Départ trajet après
          </label>
          <input
            id="res-from"
            type="datetime-local"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={toDatetimeLocalValue(filters.from)}
            onChange={(e) =>
              onChange({ ...filters, from: fromDatetimeLocalValue(e.target.value), offset: 0 })
            }
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="res-to" className="text-sm font-medium text-foreground">
            Départ trajet avant
          </label>
          <input
            id="res-to"
            type="datetime-local"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={toDatetimeLocalValue(filters.to)}
            onChange={(e) =>
              onChange({ ...filters, to: fromDatetimeLocalValue(e.target.value), offset: 0 })
            }
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="res-line" className="text-sm font-medium text-foreground">
            Ligne
          </label>
          <select
            id="res-line"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={filters.lineId ?? ""}
            onChange={(e) =>
              onChange({ ...filters, lineId: e.target.value || undefined, offset: 0 })
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
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="res-trip" className="text-sm font-medium text-foreground">
            Trip ID
          </label>
          <input
            id="res-trip"
            type="text"
            placeholder="Optionnel"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={filters.tripId ?? ""}
            onChange={(e) =>
              onChange({ ...filters, tripId: e.target.value || undefined, offset: 0 })
            }
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="res-user" className="text-sm font-medium text-foreground">
            User ID
          </label>
          <input
            id="res-user"
            type="text"
            placeholder="Optionnel"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={filters.userId ?? ""}
            onChange={(e) =>
              onChange({ ...filters, userId: e.target.value || undefined, offset: 0 })
            }
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="res-limit" className="text-sm font-medium text-foreground">
            Limite
          </label>
          <input
            id="res-limit"
            type="number"
            min={1}
            max={100}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={filters.limit ?? 50}
            onChange={(e) =>
              onChange({ ...filters, limit: Number(e.target.value) || 50, offset: 0 })
            }
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Offset : {filters.offset ?? 0}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={onPrevPage}
            disabled={(filters.offset ?? 0) <= 0}
          >
            Page préc.
          </Button>
          <Button variant="secondary" size="sm" onClick={onNextPage} disabled={!hasNextPage}>
            Page suiv.
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={onRefresh} isLoading={isRefreshing}>
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>
    </div>
  );
}
