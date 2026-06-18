import { cn } from "@/lib/cn";
import { formatDayLabel, todayParisDateKey, tomorrowParisDateKey } from "@/lib/format-date";
import type { TripsDateFilterPreset, TripsDateFilterValue } from "@/types/trips.types";

const PRESETS: { id: TripsDateFilterPreset; label: string }[] = [
  { id: "today", label: "Aujourd'hui" },
  { id: "tomorrow", label: "Demain" },
  { id: "custom", label: "Date" },
];

function presetButtonClass(active: boolean): string {
  return cn(
    "min-h-touch flex-1 rounded-md px-3 text-sm font-medium transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "border border-border bg-muted text-foreground hover:bg-muted/80"
  );
}

export interface TripsDateFilterProps {
  value: TripsDateFilterValue;
  onChange: (value: TripsDateFilterValue) => void;
}

export function TripsDateFilter({ value, onChange }: TripsDateFilterProps) {
  function selectPreset(preset: TripsDateFilterPreset) {
    if (preset === "today") {
      onChange({ preset: "today", dateKey: todayParisDateKey() });
      return;
    }
    if (preset === "tomorrow") {
      onChange({ preset: "tomorrow", dateKey: tomorrowParisDateKey() });
      return;
    }
    onChange({ preset: "custom", dateKey: value.dateKey });
  }

  return (
    <div className="mb-5">
      <p className="mb-2 text-sm font-medium text-foreground">Date</p>
      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={presetButtonClass(value.preset === preset.id)}
            onClick={() => selectPreset(preset.id)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {value.preset === "custom" ? (
        <label className="mt-3 block">
          <span className="sr-only">Choisir une date</span>
          <input
            type="date"
            value={value.dateKey}
            min={todayParisDateKey()}
            onChange={(event) =>
              onChange({ preset: "custom", dateKey: event.target.value || todayParisDateKey() })
            }
            className="min-h-touch w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
          />
        </label>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">{formatDayLabel(value.dateKey)}</p>
      )}
    </div>
  );
}
