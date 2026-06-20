import { Badge } from "@/components/ui/Badge";
import {
  boardingErrorDevCode,
  resolveBoardingErrorMessage,
} from "@/features/boarding/utils/boarding-error-messages";

export interface BoardingReasonBadgeProps {
  reason: string;
}

/** Libellé court pour historique — titre lisible, code technique en DEV seulement. */
export function BoardingReasonBadge({ reason }: BoardingReasonBadgeProps) {
  const { title } = resolveBoardingErrorMessage(reason);
  boardingErrorDevCode(reason);

  return (
    <Badge variant="muted" className="text-[10px] font-medium">
      {title}
    </Badge>
  );
}
