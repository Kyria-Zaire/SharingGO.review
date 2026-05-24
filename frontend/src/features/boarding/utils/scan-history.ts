import type { BoardingScanHistoryEntry } from "@/types/boarding.types";
import { BOARDING_SCAN_HISTORY_MAX } from "@/types/boarding.types";

export function appendScanHistory(
  entries: BoardingScanHistoryEntry[],
  entry: Omit<BoardingScanHistoryEntry, "id" | "at">
): BoardingScanHistoryEntry[] {
  const next: BoardingScanHistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
  };
  return [next, ...entries].slice(0, BOARDING_SCAN_HISTORY_MAX);
}
