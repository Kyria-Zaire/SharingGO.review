import { Link } from "react-router-dom";
import { AlertTriangle, PlaneTakeoff, QrCode } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import type { DispatchStickySummaryData } from "@/features/dispatch/hooks/useDispatchStickySummary";

interface DispatchStickySummaryProps {
  data: DispatchStickySummaryData;
}

function SummaryTile({
  label,
  value,
  href,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  icon: typeof AlertTriangle;
  tone: "critical" | "warning" | "primary";
}) {
  const toneClass =
    tone === "critical"
      ? "border-destructive/40 bg-destructive/10"
      : tone === "warning"
        ? "border-warning/40 bg-warning/10"
        : "border-primary/40 bg-primary/10";

  return (
    <Link
      to={href}
      className={cn(
        "flex min-w-[9rem] flex-1 items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/30",
        toneClass
      )}
    >
      <Icon className="h-5 w-5 shrink-0 text-foreground" aria-hidden />
      <div>
        <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}

export function DispatchStickySummary({ data }: DispatchStickySummaryProps) {
  if (data.isLoading) {
    return (
      <div
        className="sticky top-0 z-10 -mx-1 mb-4 flex gap-3 border-b border-border bg-background/95 px-1 py-3 backdrop-blur"
        aria-busy="true"
      >
        <div className="h-14 flex-1 animate-pulse rounded-lg bg-muted" />
        <div className="h-14 flex-1 animate-pulse rounded-lg bg-muted" />
        <div className="h-14 flex-1 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-10 -mx-1 mb-4 flex flex-wrap gap-3 border-b border-border bg-background/95 px-1 py-3 backdrop-blur">
      <SummaryTile
        label="Incidents critiques ouverts"
        value={data.criticalOpenCount}
        href={ROUTES.incidents}
        icon={AlertTriangle}
        tone="critical"
      />
      <SummaryTile
        label="Départs imminents (< 15 min)"
        value={data.nearDepartureCount}
        href={ROUTES.departures}
        icon={PlaneTakeoff}
        tone="warning"
      />
      <SummaryTile
        label="Boarding actif"
        value={data.activeBoardingCount}
        href={ROUTES.boarding}
        icon={QrCode}
        tone="primary"
      />
    </div>
  );
}
