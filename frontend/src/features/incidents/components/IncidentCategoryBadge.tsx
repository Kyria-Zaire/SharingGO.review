import type { IncidentCategory } from "@/types/incidents.types";
import { INCIDENT_CATEGORY_LABELS } from "@/features/incidents/constants/incident-category-labels";

export interface IncidentCategoryBadgeProps {
  category: IncidentCategory;
}

export function IncidentCategoryBadge({ category }: IncidentCategoryBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {INCIDENT_CATEGORY_LABELS[category]}
    </span>
  );
}
