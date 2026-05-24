import { Badge } from "@/components/ui/Badge";
import type { AdminPayment } from "@/types/payments.types";

export interface PaymentContextBadgeProps {
  payment: AdminPayment;
}

function resolveContextLabel(payment: AdminPayment): string | null {
  if (payment.type === "SUBSCRIPTION_ACCESS") {
    return "Accès abonnement";
  }

  if (payment.reservationId) {
    return "Réservation liée";
  }

  if (payment.type === "SUBSCRIPTION") {
    return "Abonnement Stripe";
  }

  if (payment.type === "TICKET") {
    return null;
  }

  return null;
}

export function PaymentContextBadge({ payment }: PaymentContextBadgeProps) {
  const label = resolveContextLabel(payment);

  if (!label) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <Badge variant="muted" className="font-normal">
      {label}
    </Badge>
  );
}
