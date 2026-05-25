import {
  keepPreviousData,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { listAdminActivityFeed } from "@/api/admin-activity.api";
import { queryKeys } from "@/constants/query-keys";
import {
  DISPATCH_FEED_PAGE_SIZE,
  DISPATCH_POLL_INTERVAL_MS,
  type DispatchFeedFilters,
} from "@/types/dispatch.types";
import type { ActivityFeedSeverity } from "@/types/incidents.types";
import { mergeActivityFeedPages } from "@/features/dispatch/utils/merge-feed-events";

function parseSeverity(value: string | null): ActivityFeedSeverity | undefined {
  if (value === "info" || value === "warning" || value === "critical") {
    return value;
  }
  return undefined;
}

export function useDispatchActivityFeed(options: {
  pollingEnabled: boolean;
  refreshCooldownActive: boolean;
}) {
  const [searchParams] = useSearchParams();

  const filters: DispatchFeedFilters = useMemo(
    () => ({
      severity: parseSeverity(searchParams.get("severity")),
      type: searchParams.get("type")?.trim() || undefined,
    }),
    [searchParams]
  );

  const apiFilters = useMemo(
    () => ({
      limit: DISPATCH_FEED_PAGE_SIZE,
      severity: filters.severity,
      type: filters.type,
    }),
    [filters]
  );

  const filterKey = useMemo(() => ({ ...apiFilters }), [apiFilters]);

  const feedQuery = useInfiniteQuery({
    queryKey: queryKeys.dispatch.feed(filterKey),
    queryFn: ({ pageParam }) =>
      listAdminActivityFeed({
        ...apiFilters,
        offset: typeof pageParam === "number" ? pageParam : 0,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    staleTime: DISPATCH_POLL_INTERVAL_MS,
    placeholderData: keepPreviousData,
    refetchInterval: options.pollingEnabled && !options.refreshCooldownActive
      ? DISPATCH_POLL_INTERVAL_MS
      : false,
  });

  const events = useMemo(
    () => mergeActivityFeedPages(feedQuery.data?.pages),
    [feedQuery.data?.pages]
  );

  const lastPage = feedQuery.data?.pages.at(-1);

  return {
    filters,
    feedQuery,
    events,
    lastPage,
    hasMore: lastPage ? lastPage.offset + lastPage.limit < lastPage.total : false,
  };
}
