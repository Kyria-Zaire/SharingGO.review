import { ActivityFeedCard } from "@/features/dispatch/components/ActivityFeedCard";
import type { DispatchActivityEvent } from "@/types/dispatch.types";

interface ActivityFeedListProps {
  events: DispatchActivityEvent[];
  isRefreshing?: boolean;
}

export function ActivityFeedList({ events, isRefreshing }: ActivityFeedListProps) {
  return (
    <div className="space-y-3" data-dispatch-feed>
      {isRefreshing ? (
        <p className="text-xs text-muted-foreground" role="status">
          Mise à jour en arrière-plan…
        </p>
      ) : null}
      {events.map((event) => (
        <ActivityFeedCard key={event.id} event={event} />
      ))}
    </div>
  );
}
