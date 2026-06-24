import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingPrimaryButtonClass } from "@/features/home/lib/landing-layout";
import {
  directionLabel,
  formatTripSeatsFilterLabel,
  formatTripTimeFilterLabel,
  type TripDirectionFilter,
  type TripSeatsFilter,
  type TripTimeFilter,
  type TripsClientFilters,
} from "@/features/trips/lib/trips-filters";

export interface TripsFiltersSheetProps {
  open: boolean;
  filters: TripsClientFilters;
  onChange: (filters: TripsClientFilters) => void;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      {children}
    </fieldset>
  );
}

function RadioOption({
  name,
  value,
  checked,
  label,
  onChange,
}: {
  name: string;
  value: string;
  checked: boolean;
  label: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={cn(
        "flex min-h-touch cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm transition-colors",
        checked
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-white/[0.08] bg-[#121212] text-muted-foreground hover:border-white/15"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-4 w-4 accent-primary"
      />
      {label}
    </label>
  );
}

export function TripsFiltersSheet({
  open,
  filters,
  onChange,
  onClose,
  onApply,
  onReset,
}: TripsFiltersSheetProps) {
  if (!open) return null;

  function patch(partial: Partial<TripsClientFilters>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Fermer les filtres"
        onClick={onClose}
      />

      <div
        className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/[0.08] bg-[#121212] p-5 shadow-2xl sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trips-filters-title"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="trips-filters-title" className="text-lg font-bold text-foreground">
            Filtres
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg border border-white/[0.1] text-foreground hover:bg-white/5"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="space-y-6">
          <FilterGroup label="Sens">
            {(["chalons-vatry", "vatry-chalons"] as TripDirectionFilter[]).map((direction) => (
              <RadioOption
                key={direction}
                name="direction"
                value={direction}
                checked={filters.direction === direction}
                label={directionLabel(direction)}
                onChange={(value) => patch({ direction: value as TripDirectionFilter })}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Heure">
            {(["all", "morning", "afternoon", "evening"] as TripTimeFilter[]).map((time) => (
              <RadioOption
                key={time}
                name="time"
                value={time}
                checked={filters.time === time}
                label={formatTripTimeFilterLabel(time)}
                onChange={(value) => patch({ time: value as TripTimeFilter })}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Places restantes">
            {(["all", "available"] as TripSeatsFilter[]).map((seats) => (
              <RadioOption
                key={seats}
                name="seats"
                value={seats}
                checked={filters.seats === seats}
                label={formatTripSeatsFilterLabel(seats)}
                onChange={(value) => patch({ seats: value as TripSeatsFilter })}
              />
            ))}
          </FilterGroup>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onReset}
            className="min-h-touch flex-1 rounded-lg border border-white/[0.1] text-sm font-medium text-foreground hover:bg-white/5"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className={cn(landingPrimaryButtonClass, "flex-1")}
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}
