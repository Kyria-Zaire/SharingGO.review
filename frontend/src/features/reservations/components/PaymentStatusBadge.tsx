import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { PAYMENT_STATUS_LABELS } from "@/constants/statuses";
import type { PaymentStatus } from "@/types/reservations.types";

const variantByStatus: Record<
  PaymentStatus,
  "default" | "success" | "warning" | "destructive" | "muted"
> = {
  SUCCEEDED: "success",
  PENDING: "warning",
  FAILED: "destructive",
  REFUNDED: "muted",
};

export interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const variant = variantByStatus[status as PaymentStatus] ?? "muted";
  const label =
    PAYMENT_STATUS_LABELS[status as PaymentStatus] ?? (status || "Inconnu");

  return (
    <Badge variant={variant} className={cn(className)}>
      {label}
    </Badge>
  );
}
