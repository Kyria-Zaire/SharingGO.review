import { cn } from "@/lib/cn";
import type { IncidentKpiSnapshot } from "@/features/incidents/utils/incident-kpis";

const KPI_ITEMS: {
  key: keyof IncidentKpiSnapshot;
  label: string;
  borderClass: string;
  valueClass: string;
}[] = [
  {
    key: "open",
    label: "Ouverts",
    borderClass: "border-primary/30",
    valueClass: "text-primary",
  },
  {
    key: "inProgress",
    label: "En cours",
    borderClass: "border-warning/30",
    valueClass: "text-warning",
  },
  {
    key: "critical",
    label: "Critiques",
    borderClass: "border-destructive/30",
    valueClass: "text-destructive",
  },
  {
    key: "resolvedToday",
    label: "Résolus aujourd'hui",
    borderClass: "border-border",
    valueClass: "text-foreground",
  },
];

export function IncidentKpiGrid({ kpis }: { kpis: IncidentKpiSnapshot }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {KPI_ITEMS.map(({ key, label, borderClass, valueClass }) => (
        <div key={key} className={cn("rounded-lg border bg-muted/20 px-3 py-3", borderClass)}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={cn("mt-1 text-2xl font-bold tabular-nums", valueClass)}>{kpis[key]}</p>
        </div>
      ))}
    </div>
  );
}
