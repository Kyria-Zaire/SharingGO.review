import { buildQuery } from "@/lib/build-query";
import type { ActivityFeedFilters, ActivityFeedResponse } from "@/types/incidents.types";
import { http } from "./http";

export async function listAdminActivityFeed(
  filters: ActivityFeedFilters = {}
): Promise<ActivityFeedResponse> {
  const query = buildQuery({
    limit: filters.limit !== undefined ? String(filters.limit) : undefined,
    offset: filters.offset !== undefined ? String(filters.offset) : undefined,
    severity: filters.severity,
    type: filters.type,
    from: filters.from,
    to: filters.to,
  });
  return http<ActivityFeedResponse>(`/api/admin/activity-feed${query}`);
}
