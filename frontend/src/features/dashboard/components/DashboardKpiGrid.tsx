import { DashboardKpiCard } from "@/features/dashboard/components/DashboardKpiCard";
import {
  DashboardWidget,
  DashboardWidgetLoading,
} from "@/features/dashboard/components/DashboardWidget";
import type { DashboardKpiSnapshot } from "@/features/dashboard/utils/dashboard-kpis";

export function DashboardKpiGrid({
  kpis,
  isLoading,
}: {
  kpis: DashboardKpiSnapshot;
  isLoading: boolean;
}) {
  return (
    <DashboardWidget
      title="KPIs"
      description="Métriques chargées côté client — fenêtre limitée, pas de BI"
    >
      {isLoading ? (
        <DashboardWidgetLoading />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardKpiCard
            label="Successful payments today"
            value={kpis.successfulPaymentsToday}
            hint="Paiements SUCCEEDED créés aujourd'hui"
            tone="primary"
          />
          <DashboardKpiCard
            label="Processed payments"
            value={kpis.processedPayments}
            hint="SUCCEEDED dans la fenêtre chargée"
          />
          <DashboardKpiCard
            label="Active subscriptions"
            value={kpis.subscriptionPaymentsActive}
            hint="Paiements SUBSCRIPTION réussis (proxy V1)"
          />
          <DashboardKpiCard
            label="Occupied seats"
            value={kpis.occupiedSeats}
            hint="Somme des départs à venir"
          />
          <DashboardKpiCard
            label="Trips in boarding"
            value={kpis.tripsInBoarding}
            hint="Readiness BOARDING_IN_PROGRESS"
            tone="primary"
          />
          <DashboardKpiCard
            label="Open incidents"
            value={kpis.openIncidents}
            hint="Tous statuts ouverts"
            tone={kpis.openIncidents > 0 ? "warning" : "default"}
          />
        </div>
      )}
    </DashboardWidget>
  );
}
