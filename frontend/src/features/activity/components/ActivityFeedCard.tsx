import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { formatIncidentTime } from "@/features/incidents/utils/format-incident-time";
import { ACTIVITY_INCIDENT_EVENT_LABELS } from "@/features/incidents/constants/incident-labels";
import { formatActivityEvent } from "@/features/activity/utils/format-activity-event";
import { formatShortId } from "@/lib/format-id";
import type { ActivityFeedEvent } from "@/types/incidents.types";

const severityClass: Record<ActivityFeedEvent["severity"], string> = {
  info: "border-primary/30 text-primary",
  warning: "border-warning/30 text-warning",
  critical: "border-destructive/30 text-destructive",
};

const INCIDENT_LINK_TYPES = new Set([
  "INCIDENT_CREATED",
  "INCIDENT_RESOLVED",
  "INCIDENT_CLOSED",
]);

export function ActivityFeedCard({ event }: { event: ActivityFeedEvent }) {
  const presentation = formatActivityEvent(event);
  const eventTypeLabel = ACTIVITY_INCIDENT_EVENT_LABELS[event.type] ?? event.type.replaceAll("_", " ");
  const showTechnical =
    presentation.technicalDetail &&
    presentation.technicalDetail !== presentation.summary &&
    (presentation.technicalDetail.startsWith("{") ||
      presentation.technicalDetail.startsWith("[") ||
      presentation.technicalDetail.length > presentation.summary.length);

  const incidentLink =
    INCIDENT_LINK_TYPES.has(event.type) &&
    event.entityType === "Incident" &&
    event.entityId
      ? `${ROUTES.incidents}?incidentId=${encodeURIComponent(event.entityId)}`
      : null;

  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-muted/20 px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{presentation.summary}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{eventTypeLabel}</p>
        </div>
        <span
          className={cn(
            "w-fit shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium uppercase",
            severityClass[event.severity]
          )}
        >
          {event.severity}
        </span>
      </div>

      {showTechnical ? (
        <details className="mt-2 rounded-md border border-border/60 bg-background/40 px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
            Détail technique
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto break-all whitespace-pre-wrap font-mono text-[11px] text-muted-foreground">
            {presentation.technicalDetail}
          </pre>
        </details>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="break-words">
          {formatIncidentTime(event.timestamp)}
          {event.actorName ? ` · ${event.actorName}` : ""}
          {event.entityType && event.entityId
            ? ` · ${event.entityType} ${formatShortId(event.entityId)}`
            : ""}
        </span>
        {incidentLink ? (
          <Link
            to={incidentLink}
            className="font-medium text-primary hover:underline"
          >
            Voir l'incident
          </Link>
        ) : null}
      </div>
    </article>
  );
}
