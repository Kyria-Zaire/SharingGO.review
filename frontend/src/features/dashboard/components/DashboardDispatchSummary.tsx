import { Link } from "react-router-dom";
import { AlertTriangle, Bus, PlaneTakeoff, QrCode, Server } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { DashboardWidget, DashboardWidgetLoading } from "@/features/dashboard/components/DashboardWidget";

interface SummaryTileProps {
  label: string;
  value: number;
  href: string;
  icon: typeof AlertTriangle;
  tone: "critical" | "warning" | "primary" | "muted";
}

function SummaryTile({ label, value, href, icon: Icon, tone }: SummaryTileProps) {
  const toneClass =
    tone === "critical"
      ? "border-destructive/60 bg-destructive/15 hover:bg-destructive/20"
      : tone === "warning"
        ? "border-warning/50 bg-warning/10 hover:bg-warning/15"
        : tone === "primary"
          ? "border-primary/45 bg-primary/10 hover:bg-primary/15"
          : "border-border bg-muted/20 hover:bg-muted/30";

  return (
    <Link
      to={href}
      className={cn(
        "flex min-w-[9rem] flex-1 items-center gap-3 rounded-lg border px-3 py-3 transition-colors",
        toneClass
      )}
    >
      <Icon className="h-5 w-5 shrink-0 text-foreground" aria-hidden />
      <div>
        <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}

export function DashboardDispatchSummary({
  criticalOpenCount,
  nearDepartureCount,
  activeBoardingCount,
  tripsFullCount,
  monitoringWarningCount,
  isLoading,
}: {
  criticalOpenCount: number;
  nearDepartureCount: number;
  activeBoardingCount: number;
  tripsFullCount: number;
  monitoringWarningCount: number;
  isLoading: boolean;
}) {
  return (
    <DashboardWidget
      title="Dispatch Summary"
      description="Vue instantanée — incidents, départs, boarding"
      tone="ops"
    >
      {isLoading ? (
        <DashboardWidgetLoading />
      ) : (
        <div className="flex flex-wrap gap-3">
          <SummaryTile
            label="Incidents critiques"
            value={criticalOpenCount}
            href={ROUTES.incidents}
            icon={AlertTriangle}
            tone={criticalOpenCount > 0 ? "critical" : "muted"}
          />
          <SummaryTile
            label="Départs < 15 min"
            value={nearDepartureCount}
            href={ROUTES.departures}
            icon={PlaneTakeoff}
            tone={nearDepartureCount > 0 ? "warning" : "muted"}
          />
          <SummaryTile
            label="Boarding actif"
            value={activeBoardingCount}
            href={ROUTES.boarding}
            icon={QrCode}
            tone={activeBoardingCount > 0 ? "primary" : "muted"}
          />
          <SummaryTile
            label="Trajets complets"
            value={tripsFullCount}
            href={ROUTES.trips}
            icon={Bus}
            tone={tripsFullCount > 0 ? "warning" : "muted"}
          />
          <SummaryTile
            label="Alertes monitoring"
            value={monitoringWarningCount}
            href={ROUTES.monitoring}
            icon={Server}
            tone={monitoringWarningCount > 0 ? "critical" : "muted"}
          />
        </div>
      )}
    </DashboardWidget>
  );
}
