import { formatDate } from "@/lib/format-date";
import { formatShortId } from "@/lib/format-id";
import type { BoardingScanHistoryEntry } from "@/types/boarding.types";
import { BoardingReasonBadge } from "./BoardingReasonBadge";
import { BoardingStatusBadge } from "./BoardingStatusBadge";

interface ScanHistoryListProps {
  entries: BoardingScanHistoryEntry[];
}

export function ScanHistoryList({ entries }: ScanHistoryListProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun scan dans cette session — l’historique est limité aux 20 derniers scans.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-sm">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <BoardingStatusBadge status={entry.uiStatus} />
              <span className="font-medium text-foreground">{entry.title}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                {entry.action === "validate" ? "Contrôle" : "Consommer"}
              </span>
              {entry.reason ? <BoardingReasonBadge reason={entry.reason} /> : null}
            </div>
            {entry.reservationId ? (
              <p className="font-mono text-xs text-muted-foreground">
                Réservation {formatShortId(entry.reservationId)}
              </p>
            ) : null}
          </div>
          <time className="text-xs text-muted-foreground">{formatDate(entry.at)}</time>
        </li>
      ))}
    </ul>
  );
}
