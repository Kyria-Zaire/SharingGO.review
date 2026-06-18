import { cn } from "@/lib/cn";
import type { BookingsFilter } from "@/hooks/useUserReservations";

const FILTERS: { id: BookingsFilter; label: string }[] = [
  { id: "upcoming", label: "À venir" },
  { id: "past", label: "Passées" },
  { id: "all", label: "Toutes" },
];

export interface BookingsFilterTabsProps {
  value: BookingsFilter;
  onChange: (filter: BookingsFilter) => void;
}

export function BookingsFilterTabs({ value, onChange }: BookingsFilterTabsProps) {
  return (
    <div
      className="mb-5 flex gap-1 rounded-lg border border-border bg-muted/40 p-1"
      role="tablist"
      aria-label="Filtrer les réservations"
    >
      {FILTERS.map((filter) => {
        const isActive = value === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              "min-h-touch flex-1 rounded-md px-3 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
