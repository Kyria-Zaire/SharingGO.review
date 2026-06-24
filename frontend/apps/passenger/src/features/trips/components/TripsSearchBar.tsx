import { ArrowLeftRight, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDayLabel, todayParisDateKey } from "@/lib/format-date";
import {
  directionLabel,
  type TripDirectionFilter,
} from "@/features/trips/lib/trips-filters";

const FIELD_HEIGHT = "h-11";
const FIELD_CLASS =
  "w-full rounded-lg border border-white/[0.12] bg-black/30 text-sm text-foreground backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
const GLASS_PANEL_CLASS =
  "rounded-2xl border border-white/[0.14] bg-black/35 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150 sm:p-5";
const GLASS_ICON_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-lg border border-white/[0.12] bg-black/30 text-foreground backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export interface TripsSearchBarProps {
  direction: TripDirectionFilter;
  dateKey: string;
  onDirectionChange: (direction: TripDirectionFilter) => void;
  onDateChange: (dateKey: string) => void;
  onSwapDirection: () => void;
  onSearch: () => void;
}

export function TripsSearchBar({
  direction,
  dateKey,
  onDirectionChange,
  onDateChange,
  onSwapDirection,
  onSearch,
}: TripsSearchBarProps) {
  const formattedDate = formatDayLabel(dateKey);

  return (
    <div className={GLASS_PANEL_CLASS}>
      {/* Mobile */}
      <div className="flex flex-col gap-4 lg:hidden">
        <div>
          <label htmlFor="trips-direction" className="mb-2 block text-xs font-medium text-muted-foreground">
            Sens
          </label>
          <div className="flex gap-2">
            <select
              id="trips-direction"
              value={direction}
              onChange={(event) =>
                onDirectionChange(event.target.value as TripDirectionFilter)
              }
              className={cn(FIELD_CLASS, FIELD_HEIGHT, "flex-1 px-3")}
            >
              <option value="chalons-vatry">{directionLabel("chalons-vatry")}</option>
              <option value="vatry-chalons">{directionLabel("vatry-chalons")}</option>
            </select>
            <button
              type="button"
              onClick={onSwapDirection}
              className={cn(GLASS_ICON_BUTTON_CLASS, FIELD_HEIGHT, "w-11 shrink-0")}
              aria-label="Inverser le sens du trajet"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="trips-date" className="mb-2 block text-xs font-medium text-muted-foreground">
            Date
          </label>
          <div className="relative">
            <Calendar
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              id="trips-date"
              type="date"
              value={dateKey}
              min={todayParisDateKey()}
              onChange={(event) => onDateChange(event.target.value || todayParisDateKey())}
              className={cn(FIELD_CLASS, FIELD_HEIGHT, "py-0 pl-10 pr-3")}
            />
          </div>
          <p className="mt-1.5 min-h-4 text-xs text-muted-foreground">{formattedDate}</p>
        </div>

        <button
          type="button"
          onClick={onSearch}
          className={cn(
            FIELD_HEIGHT,
            "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          <Search className="h-4 w-4" aria-hidden />
          Rechercher
        </button>
      </div>

      {/* Desktop — grille 3 lignes : labels / champs / aide */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.35fr)_auto_minmax(0,1fr)_auto] lg:grid-rows-[auto_auto_auto] lg:gap-x-3">
        <label
          htmlFor="trips-direction-desktop"
          className="col-start-1 row-start-1 mb-2 self-end text-xs font-medium text-muted-foreground"
        >
          Sens
        </label>

        <label
          htmlFor="trips-date-desktop"
          className="col-start-3 row-start-1 mb-2 self-end text-xs font-medium text-muted-foreground"
        >
          Date
        </label>

        <select
          id="trips-direction-desktop"
          value={direction}
          onChange={(event) =>
            onDirectionChange(event.target.value as TripDirectionFilter)
          }
          className={cn(FIELD_CLASS, FIELD_HEIGHT, "col-start-1 row-start-2 px-3")}
        >
          <option value="chalons-vatry">{directionLabel("chalons-vatry")}</option>
          <option value="vatry-chalons">{directionLabel("vatry-chalons")}</option>
        </select>

        <button
          type="button"
          onClick={onSwapDirection}
          className={cn(GLASS_ICON_BUTTON_CLASS, FIELD_HEIGHT, "col-start-2 row-start-2 w-11 self-center")}
          aria-label="Inverser le sens du trajet"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden />
        </button>

        <div className="relative col-start-3 row-start-2 self-center">
          <Calendar
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="trips-date-desktop"
            type="date"
            value={dateKey}
            min={todayParisDateKey()}
            onChange={(event) => onDateChange(event.target.value || todayParisDateKey())}
            className={cn(FIELD_CLASS, FIELD_HEIGHT, "py-0 pl-10 pr-3")}
          />
        </div>

        <button
          type="button"
          onClick={onSearch}
          className={cn(
            FIELD_HEIGHT,
            "col-start-4 row-start-2 inline-flex min-w-[10.5rem] items-center justify-center gap-2 self-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          <Search className="h-4 w-4" aria-hidden />
          Rechercher
        </button>

        <div className="col-start-1 row-start-3 mt-1.5 min-h-4" aria-hidden />

        <p className="col-start-3 col-end-4 row-start-3 mt-1.5 min-h-4 text-xs text-muted-foreground">
          {formattedDate}
        </p>
      </div>
    </div>
  );
}
