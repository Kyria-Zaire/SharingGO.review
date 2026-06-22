import { DashboardKpiCard } from "@/features/dashboard/components/DashboardKpiCard";
import {
  DashboardWidget,
  DashboardWidgetLoading,
} from "@/features/dashboard/components/DashboardWidget";
import {
  formatCurrency,
  formatPercent,
} from "@/features/reports/utils/reports-period";
import type { OperationsOverviewResponse } from "@/types/reports.types";

interface ReportsKpiOverviewProps {
  overview: OperationsOverviewResponse | undefined;
  isLoading: boolean;
}

export function ReportsKpiOverview({ overview, isLoading }: ReportsKpiOverviewProps) {
  return (
    <DashboardWidget
      title="Synthèse exploitation"
      description={
        overview
          ? `Période ${overview.meta.timezone} · généré ${new Date(overview.meta.generatedAt).toLocaleString("fr-FR")}`
          : "Indicateurs agrégés sur la période sélectionnée"
      }
    >
      {isLoading ? (
        <DashboardWidgetLoading />
      ) : overview ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          <DashboardKpiCard label="Total trajets" value={overview.totalTrips} />
          <DashboardKpiCard label="Trajets complétés" value={overview.completedTrips} tone="primary" />
          <DashboardKpiCard label="Trajets annulés" value={overview.cancelledTrips} />
          <DashboardKpiCard label="Réservations" value={overview.totalReservations} />
          <DashboardKpiCard label="Embarqués" value={overview.usedReservations} tone="primary" />
          <DashboardKpiCard
            label="Taux embarquement"
            value={formatPercent(overview.boardingRate)}
            hint="Embarqués / réservations confirmées"
          />
          <DashboardKpiCard
            label="Taux remplissage"
            value={formatPercent(overview.occupancyRate)}
            hint="Places occupées / capacité"
          />
          <DashboardKpiCard
            label="Recette totale"
            value={formatCurrency(overview.totalRevenue, overview.currency)}
            tone="primary"
          />
          <DashboardKpiCard label="Incidents" value={overview.totalIncidents} />
          <DashboardKpiCard
            label="Incidents critiques"
            value={overview.criticalIncidents}
            tone={overview.criticalIncidents > 0 ? "warning" : "default"}
          />
        </div>
      ) : null}
    </DashboardWidget>
  );
}
