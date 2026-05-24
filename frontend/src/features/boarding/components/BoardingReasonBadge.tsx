import { Badge } from "@/components/ui/Badge";

export interface BoardingReasonBadgeProps {
  reason: string;
}

export function BoardingReasonBadge({ reason }: BoardingReasonBadgeProps) {
  return (
    <Badge variant="muted" className="font-mono text-[10px]">
      {reason}
    </Badge>
  );
}
