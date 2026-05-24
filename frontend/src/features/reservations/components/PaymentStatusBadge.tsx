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
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  return (
    <Badge variant={variantByStatus[status]} className={cn(className)}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
