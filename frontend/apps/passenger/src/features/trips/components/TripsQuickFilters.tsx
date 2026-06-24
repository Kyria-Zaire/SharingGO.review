import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  formatDayLabel,
  todayParisDateKey,
  tomorrowParisDateKey,
} from "@/lib/format-date";
import type { TripsDateFilterValue } from "@/types/trips.types";

function shortDayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function presetButtonClass(active: boolean): string {
  return cn(
    "min-h-touch shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
    active
      ? "border-primary/50 bg-primary/10 text-primary"
      : "border-white/[0.1] bg-[#121212] text-foreground hover:border-white/20"
  );
}

export interface TripsQuickFiltersProps {
  value: TripsDateFilterValue;
  nextDepartureDateKey: string | null;
  onChange: (value: TripsDateFilterValue) => void;
  onOpenDatePicker: () => void;
}

export function TripsQuickFilters({
  value,
  nextDepartureDateKey,
  onChange,
  onOpenDatePicker,
}: TripsQuickFiltersProps) {
  const todayKey = todayParisDateKey();
  const tomorrowKey = tomorrowParisDateKey();

  function selectToday() {
    onChange({ preset: "today", dateKey: todayKey });
  }

  function selectTomorrow() {
    onChange({ preset: "tomorrow", dateKey: tomorrowKey });
  }

  function selectNext() {
    if (!nextDepartureDateKey) return;
    onChange({ preset: "next", dateKey: nextDepartureDateKey });
  }

  const todayLabel = `Aujourd'hui (${shortDayLabel(todayKey)})`;
  const tomorrowLabel = `Demain (${shortDayLabel(tomorrowKey)})`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={presetButtonClass(value.preset === "today")}
        onClick={selectToday}
      >
        {todayLabel}
      </button>

      <button
        type="button"
        className={presetButtonClass(value.preset === "tomorrow")}
        onClick={selectTomorrow}
      >
        {tomorrowLabel}
      </button>

      {nextDepartureDateKey ? (
        <button
          type="button"
          className={presetButtonClass(value.preset === "next")}
          onClick={selectNext}
        >
          Prochain départ
          <span className="sr-only">{formatDayLabel(nextDepartureDateKey)}</span>
        </button>
      ) : null}

      <button
        type="button"
        className={cn(presetButtonClass(value.preset === "custom"), "inline-flex items-center gap-2")}
        onClick={onOpenDatePicker}
      >
        <CalendarDays className="h-4 w-4" aria-hidden />
        Choisir une date
      </button>
    </div>
  );
}
