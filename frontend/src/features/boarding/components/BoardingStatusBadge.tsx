import { Badge } from "@/components/ui/Badge";
import type { BoardingUiStatus } from "@/types/boarding.types";

const variantByStatus: Record<
  BoardingUiStatus,
  "success" | "warning" | "destructive" | "muted"
> = {
  success: "success",
  warning: "warning",
  error: "destructive",
};

const labelByStatus: Record<BoardingUiStatus, string> = {
  success: "Succès",
  warning: "Attention",
  error: "Refus",
};

export interface BoardingStatusBadgeProps {
  status: BoardingUiStatus;
}

export function BoardingStatusBadge({ status }: BoardingStatusBadgeProps) {
  return <Badge variant={variantByStatus[status]}>{labelByStatus[status]}</Badge>;
}
