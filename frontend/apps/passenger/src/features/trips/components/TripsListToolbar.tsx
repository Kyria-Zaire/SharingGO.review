import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatTripSortLabel, type TripSortOption } from "@/features/trips/lib/trips-filters";

export interface TripsListToolbarProps {
  tripCount: number;
  sort: TripSortOption;
  activeFiltersCount: number;
  onSortChange: (sort: TripSortOption) => void;
  onOpenFilters: () => void;
}

export function TripsListToolbar({
  tripCount,
  sort,
  activeFiltersCount,
  onSortChange,
  onOpenFilters,
}: TripsListToolbarProps) {
  return (
    <div className="mb-2 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between lg:mb-5 lg:gap-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{tripCount}</span>{" "}
        {tripCount <= 1 ? "trajet disponible" : "trajets disponibles"}
      </p>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <label className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="shrink-0">Trier par :</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as TripSortOption)}
            className="min-h-touch max-w-full rounded-lg border border-white/[0.1] bg-[#121212] px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Trier les trajets"
          >
            <option value="departure">{formatTripSortLabel("departure")}</option>
            <option value="seats">{formatTripSortLabel("seats")}</option>
          </select>
        </label>

        <button
          type="button"
          onClick={onOpenFilters}
          className={cn(
            "inline-flex min-h-touch items-center gap-2 rounded-lg border border-white/[0.1] bg-[#121212] px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filtres
          {activeFiltersCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[0.65rem] font-bold text-primary-foreground">
              {activeFiltersCount}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}
