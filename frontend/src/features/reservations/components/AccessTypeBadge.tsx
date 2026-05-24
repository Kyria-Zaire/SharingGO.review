import { Badge } from "@/components/ui/Badge";
import { PAYMENT_TYPE_LABELS } from "@/constants/statuses";
import type { PaymentType } from "@/types/reservations.types";

export interface AccessTypeBadgeProps {
  type?: PaymentType | null;
}

export function AccessTypeBadge({ type }: AccessTypeBadgeProps) {
  if (!type) {
    return <Badge variant="muted">Accès inconnu</Badge>;
  }

  const label = PAYMENT_TYPE_LABELS[type] ?? type;
  const variant = type === "SUBSCRIPTION_ACCESS" ? "success" : "default";

  return <Badge variant={variant}>{label}</Badge>;
}
