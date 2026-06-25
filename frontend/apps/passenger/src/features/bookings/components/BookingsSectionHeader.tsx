import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { BOOKINGS_FILTER_LABELS } from "@/features/bookings/constants/bookings-content";
import {
  BOOKINGS_SORT_OPTIONS,
  type BookingsSortOption,
} from "@/features/bookings/lib/bookings-sort";
import type { BookingsFilter } from "@/hooks/useUserReservations";

export interface BookingsSectionHeaderProps {
  filter: BookingsFilter;
  count: number;
  sort: BookingsSortOption;
  onSortChange: (sort: BookingsSortOption) => void;
  onOpenMobileSort?: () => void;
}

export function BookingsSectionHeader({
  filter,
  count,
  sort,
  onSortChange,
  onOpenMobileSort,
}: BookingsSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-5">
      <div className="flex items-center gap-2.5">
        <h2 className="text-lg font-bold text-foreground lg:text-xl">
          {BOOKINGS_FILTER_LABELS[filter]}
        </h2>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/15 px-2 text-xs font-bold text-primary">
          {count}
        </span>
      </div>

      <label className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
        <span className="shrink-0">Trier par</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as BookingsSortOption)}
          className="min-h-[2.375rem] min-w-[11rem] rounded-lg border border-white/[0.1] bg-[#121212] px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Trier les réservations"
        >
          {BOOKINGS_SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={onOpenMobileSort}
        className={cn(
          "inline-flex min-h-touch items-center gap-2 rounded-lg border border-white/[0.1] bg-[#121212] px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/35 lg:hidden"
        )}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filtrer
      </button>
    </div>
  );
}
