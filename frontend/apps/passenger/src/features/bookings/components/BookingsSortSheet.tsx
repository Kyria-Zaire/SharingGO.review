import { cn } from "@/lib/cn";
import {
  BOOKINGS_SORT_OPTIONS,
  type BookingsSortOption,
} from "@/features/bookings/lib/bookings-sort";

export interface BookingsSortSheetProps {
  open: boolean;
  sort: BookingsSortOption;
  onClose: () => void;
  onSortChange: (sort: BookingsSortOption) => void;
}

export function BookingsSortSheet({
  open,
  sort,
  onClose,
  onSortChange,
}: BookingsSortSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        aria-label="Fermer le tri"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-white/[0.08] bg-[#161616] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(0,0,0,0.55)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookings-sort-title"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="bookings-sort-title" className="text-base font-semibold text-foreground">
            Trier les réservations
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-primary"
          >
            Fermer
          </button>
        </div>
        <ul className="space-y-2">
          {BOOKINGS_SORT_OPTIONS.map((option) => {
            const isActive = option.id === sort;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSortChange(option.id);
                    onClose();
                  }}
                  className={cn(
                    "flex min-h-touch w-full items-center rounded-lg px-4 text-left text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
