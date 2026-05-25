import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { ActivityFeedCard } from "@/features/dispatch/components/ActivityFeedCard";
import {
  DashboardWidget,
  DashboardWidgetEmpty,
  DashboardWidgetLoading,
} from "@/features/dashboard/components/DashboardWidget";
import type { DispatchActivityEvent } from "@/types/dispatch.types";

export function DashboardActivityPreview({
  events,
  isLoading,
}: {
  events: DispatchActivityEvent[];
  isLoading: boolean;
}) {
  return (
    <DashboardWidget
      title="Activity Feed Preview"
      description="Derniers événements opérationnels"
      actions={
        <Link
          to={ROUTES.dispatch}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Voir tout
          <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      {isLoading ? (
        <DashboardWidgetLoading />
      ) : events.length === 0 ? (
        <DashboardWidgetEmpty message="Aucune activité opérationnelle récente." />
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <ActivityFeedCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </DashboardWidget>
  );
}
