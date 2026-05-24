import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format-date";
import { formatCurrency } from "@/lib/format-currency";
import { formatShortId } from "@/lib/format-id";
import type { AdminPayment } from "@/types/payments.types";
import { formatPassengerLabel } from "@/features/reservations/utils/passenger-label";
import { AccessTypeBadge } from "@/features/reservations/components/AccessTypeBadge";
import { PaymentStatusBadge } from "@/features/reservations/components/PaymentStatusBadge";
import { PaymentContextBadge } from "./PaymentContextBadge";

export interface PaymentsTableProps {
  payments: AdminPayment[];
  highlightedPaymentId?: string | null;
}

export function PaymentsTable({ payments, highlightedPaymentId }: PaymentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[1200px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Paiement</th>
            <th className="px-4 py-3 font-medium">Utilisateur</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Montant</th>
            <th className="px-4 py-3 font-medium">Devise</th>
            <th className="px-4 py-3 font-medium">Réservation</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Contexte</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {payments.map((payment) => (
            <tr
              key={payment.id}
              className={cn(
                "hover:bg-muted/20",
                payment.id === highlightedPaymentId && "bg-primary/10 ring-1 ring-inset ring-primary/30"
              )}
            >
              <td className="px-4 py-3 font-mono text-foreground" title={payment.id}>
                {formatShortId(payment.id)}
              </td>
              <td className="px-4 py-3">
                <p className="text-foreground">{formatPassengerLabel(payment.user)}</p>
                {payment.user.email ? (
                  <p className="text-xs text-muted-foreground">{payment.user.email}</p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <AccessTypeBadge type={payment.type} />
              </td>
              <td className="px-4 py-3">
                <PaymentStatusBadge status={payment.status} />
              </td>
              <td className="px-4 py-3 font-medium text-foreground">
                {formatCurrency(payment.amount, payment.currency)}
              </td>
              <td className="px-4 py-3 uppercase text-muted-foreground">{payment.currency}</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">
                {payment.reservationId ? (
                  <span title={payment.reservationId}>{formatShortId(payment.reservationId)}</span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.createdAt)}</td>
              <td className="px-4 py-3">
                <PaymentContextBadge payment={payment} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
