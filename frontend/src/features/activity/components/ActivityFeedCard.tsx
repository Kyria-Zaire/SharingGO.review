import { cn } from "@/lib/cn";
import { formatIncidentTime } from "@/features/incidents/utils/format-incident-time";
import type { ActivityFeedEvent } from "@/types/incidents.types";

const severityClass: Record<ActivityFeedEvent["severity"], string> = {
  info: "border-primary/30 text-primary",
  warning: "border-warning/30 text-warning",
  critical: "border-destructive/30 text-destructive",
};

export function ActivityFeedCard({ event }: { event: ActivityFeedEvent }) {
  return (
    <article className="rounded-lg border border-border bg-muted/20 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{event.title}</p>
          <p className="font-mono text-xs text-muted-foreground">{event.type}</p>
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-xs font-medium uppercase",
            severityClass[event.severity]
          )}
        >
          {event.severity}
        </span>
      </div>
      {event.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">
        {formatIncidentTime(event.timestamp)}
        {event.actorName ? ` · ${event.actorName}` : ""}
        {event.entityType && event.entityId
          ? ` · ${event.entityType} ${event.entityId.slice(0, 8)}…`
          : ""}
      </p>
    </article>
  );
}
