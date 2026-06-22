import {
  DashboardWidget,
  DashboardWidgetLoading,
} from "@/features/dashboard/components/DashboardWidget";
import { formatCurrency } from "@/features/reports/utils/reports-period";
import type { OperationsOverviewResponse, OperationsRevenueReportResponse, RevenueBucket } from "@/types/reports.types";

interface ReportsRevenueSectionProps {
  revenue: OperationsRevenueReportResponse | undefined;
  overview: OperationsOverviewResponse | undefined;
  isLoading: boolean;
}

function RevenueBucketTable({
  title,
  buckets,
  currency,
}: {
  title: string;
  buckets: RevenueBucket[];
  currency: string;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-foreground">{title}</h4>
      {buckets.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune donnée sur cette granularité.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Période</th>
                <th className="px-4 py-3 font-medium">CA</th>
                <th className="px-4 py-3 font-medium">Paiements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {buckets.map((bucket) => (
                <tr key={bucket.key} className="bg-background">
                  <td className="px-4 py-3 font-medium text-foreground">{bucket.key}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {formatCurrency(bucket.amount, currency)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{bucket.paymentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ReportsRevenueSection({
  revenue,
  overview,
  isLoading,
}: ReportsRevenueSectionProps) {
  return (
    <DashboardWidget
      title="Recettes"
      description="Agrégation par date de paiement — tableaux uniquement, pas de graphique"
    >
      {isLoading ? (
        <DashboardWidgetLoading />
      ) : revenue ? (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                CA total
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
                {formatCurrency(revenue.totalAmount, revenue.currency)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Paiements réussis
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
                {revenue.totalPaymentCount}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Trajets (période)
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
                {overview?.totalTrips ?? "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Réservations
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
                {overview?.totalReservations ?? "—"}
              </p>
            </div>
          </div>

          <RevenueBucketTable title="Par jour" buckets={revenue.byDay} currency={revenue.currency} />
          <RevenueBucketTable
            title="Par semaine"
            buckets={revenue.byWeek}
            currency={revenue.currency}
          />
          <RevenueBucketTable title="Par mois" buckets={revenue.byMonth} currency={revenue.currency} />
        </div>
      ) : null}
    </DashboardWidget>
  );
}
