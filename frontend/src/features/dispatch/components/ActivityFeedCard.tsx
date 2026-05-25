import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/relativeTime";
import { sanitizeFeedDescription } from "@/features/dispatch/utils/sanitize-feed-description";
import {
  getDispatchEntityHref,
  getDispatchEntityLabel,
} from "@/features/dispatch/utils/entity-links";
import type { DispatchActivityEvent } from "@/types/dispatch.types";

const severityClass: Record<DispatchActivityEvent["severity"], string> = {
  info: "border-primary/30 text-primary",
  warning: "border-warning/30 text-warning",
  critical: "border-destructive/30 text-destructive",
};

export function ActivityFeedCard({ event }: { event: DispatchActivityEvent }) {
  const description = sanitizeFeedDescription(event.description);
  const entityHref = getDispatchEntityHref(event);
  const entityLabel = getDispatchEntityLabel(event);

  return (
    <article className="rounded-lg border border-border bg-muted/20 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{event.title}</p>
          <p className="font-mono text-xs text-muted-foreground">{event.type}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium uppercase",
            severityClass[event.severity]
          )}
        >
          {event.severity}
        </span>
      </div>

      {description ? (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{description}</p>
      ) : null}

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <time dateTime={event.timestamp} title={event.timestamp}>
          {relativeTime(event.timestamp)}
        </time>
        {event.actorName ? <span>· {event.actorName}</span> : null}
        {entityLabel && entityHref ? (
          <Link to={entityHref} className="text-primary hover:underline">
            · {entityLabel}
          </Link>
        ) : null}
      </p>
    </article>
  );
}
