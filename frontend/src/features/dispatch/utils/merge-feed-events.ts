import type { ActivityFeedResponse } from "@/types/incidents.types";
import type { DispatchActivityEvent } from "@/types/dispatch.types";

export function mergeActivityFeedPages(
  pages: ActivityFeedResponse[] | undefined
): DispatchActivityEvent[] {
  if (!pages?.length) return [];

  const byId = new Map<string, DispatchActivityEvent>();

  for (const page of pages) {
    for (const event of page.events) {
      if (!byId.has(event.id)) {
        byId.set(event.id, event);
      }
    }
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function hasMoreFeedPages(lastPage: ActivityFeedResponse | undefined): boolean {
  if (!lastPage) return false;
  return lastPage.offset + lastPage.limit < lastPage.total;
}
