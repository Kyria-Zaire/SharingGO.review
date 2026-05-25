import type { ActivityFeedEvent, ActivityFeedSeverity } from "@/types/incidents.types";

/** Aligné sur GET /api/admin/activity-feed — ne pas inventer de champs. */
export type DispatchActivityEvent = ActivityFeedEvent;

export type DispatchFeedSeverity = ActivityFeedSeverity;

export interface DispatchFeedFilters {
  severity?: DispatchFeedSeverity;
  type?: string;
}

export const DISPATCH_FEED_PAGE_SIZE = 20;
export const DISPATCH_POLL_INTERVAL_MS = 30_000;
export const DISPATCH_REFRESH_COOLDOWN_MS = 2_000;
