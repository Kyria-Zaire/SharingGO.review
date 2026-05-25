import { cn } from "@/lib/cn";

interface DashboardKpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "primary" | "warning";
}

const toneClass = {
  default: "border-border bg-muted/25",
  primary: "border-primary/40 bg-primary/10",
  warning: "border-warning/40 bg-warning/10",
};

export function DashboardKpiCard({ label, value, hint, tone = "default" }: DashboardKpiCardProps) {
  return (
    <div className={cn("rounded-lg border px-3 py-3", toneClass[tone])}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
