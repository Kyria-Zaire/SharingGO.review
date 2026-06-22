import { Button } from "@/components/ui/Button";
import type { ReportsPeriodPreset, ReportsPeriodState } from "@/types/reports.types";

interface ReportsPeriodBarProps {
  period: ReportsPeriodState;
  onChange: (period: ReportsPeriodState) => void;
}

const PRESETS: { id: ReportsPeriodPreset; label: string }[] = [
  { id: "today", label: "Aujourd'hui" },
  { id: "7d", label: "7 jours" },
  { id: "30d", label: "30 jours" },
];

export function ReportsPeriodBar({ period, onChange }: ReportsPeriodBarProps) {
  return (
    <div className="mb-6 space-y-3 rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            size="sm"
            variant={period.preset === preset.id ? "primary" : "secondary"}
            onClick={() =>
              onChange({
                preset: preset.id,
                from:
                  preset.id === "today"
                    ? new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
                    : preset.id === "30d"
                      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                to: new Date().toISOString(),
              })
            }
          >
            {preset.label}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant={period.preset === "custom" ? "primary" : "secondary"}
          onClick={() => onChange({ ...period, preset: "custom" })}
        >
          Personnalisé
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Début</span>
          <input
            type="datetime-local"
            value={period.from.slice(0, 16)}
            onChange={(e) =>
              onChange({
                ...period,
                preset: "custom",
                from: e.target.value ? new Date(e.target.value).toISOString() : period.from,
              })
            }
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Fin</span>
          <input
            type="datetime-local"
            value={period.to.slice(0, 16)}
            onChange={(e) =>
              onChange({
                ...period,
                preset: "custom",
                to: e.target.value ? new Date(e.target.value).toISOString() : period.to,
              })
            }
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
      </div>
    </div>
  );
}
