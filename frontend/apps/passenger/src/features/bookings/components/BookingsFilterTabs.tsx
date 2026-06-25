import { Ban, Calendar, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { BOOKINGS_FILTER_LABELS } from "@/features/bookings/constants/bookings-content";
import type { BookingsFilter } from "@/hooks/useUserReservations";

const FILTERS: {
  id: BookingsFilter;
  icon: typeof Calendar;
}[] = [
  { id: "upcoming", icon: Calendar },
  { id: "past", icon: CalendarCheck },
  { id: "canceled", icon: Ban },
];

export interface BookingsFilterTabsProps {
  value: BookingsFilter;
  onChange: (filter: BookingsFilter) => void;
}

export function BookingsFilterTabs({ value, onChange }: BookingsFilterTabsProps) {
  return (
    <div
      className="flex gap-6 overflow-x-auto border-b border-white/[0.08] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Filtrer les réservations"
    >
      {FILTERS.map((filter) => {
        const isActive = value === filter.id;
        const Icon = filter.icon;

        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              "relative flex min-h-touch shrink-0 items-center gap-2 pb-3 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(filter.id)}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {BOOKINGS_FILTER_LABELS[filter.id]}
            {isActive ? (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
