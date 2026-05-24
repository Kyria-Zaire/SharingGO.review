import { formatCurrency } from "@/lib/format-currency";
import type { PaymentPageKpis } from "@/types/payments.types";

interface PaymentsPageKpisProps {
  kpis: PaymentPageKpis;
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function PaymentsPageKpis({ kpis }: PaymentsPageKpisProps) {
  return (
    <section className="mb-6 space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Sur la page affichée
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total paiements" value={kpis.total} />
        <KpiCard label="Réussis" value={kpis.succeeded} />
        <KpiCard label="Échoués" value={kpis.failed} />
        <KpiCard
          label="Montant réussi"
          value={formatCurrency(kpis.amountTotal, kpis.currency)}
        />
      </div>
    </section>
  );
}
