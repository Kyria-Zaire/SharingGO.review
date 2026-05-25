import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ApiError } from "@/api/http";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { DISPATCH_REFRESH_COOLDOWN_MS } from "@/types/dispatch.types";
import { ActivityFeedList } from "@/features/dispatch/components/ActivityFeedList";
import { ActivityFilters } from "@/features/dispatch/components/ActivityFilters";
import { DispatchStickySummary } from "@/features/dispatch/components/DispatchStickySummary";
import { LoadMoreButton } from "@/features/dispatch/components/LoadMoreButton";
import { useDispatchActivityFeed } from "@/features/dispatch/hooks/useDispatchActivityFeed";
import { useDispatchStickySummary } from "@/features/dispatch/hooks/useDispatchStickySummary";

export function DispatchPage() {
  const [refreshCooldown, setRefreshCooldown] = useState(false);

  const sticky = useDispatchStickySummary();

  const { feedQuery, events, hasMore, lastPage } = useDispatchActivityFeed({
    pollingEnabled: true,
    refreshCooldownActive: refreshCooldown,
  });

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    for (const event of events) {
      if (event.type) types.add(event.type);
    }
    return Array.from(types);
  }, [events]);

  const handleManualRefresh = async () => {
    setRefreshCooldown(true);
    await feedQuery.refetch();
    window.setTimeout(() => setRefreshCooldown(false), DISPATCH_REFRESH_COOLDOWN_MS);
  };

  const isInitialLoading = feedQuery.isLoading && !feedQuery.data;
  const showFeed = !feedQuery.isError && events.length > 0;
  const showEmpty =
    !isInitialLoading && !feedQuery.isError && events.length === 0 && !feedQuery.isFetching;
  const isStaleRefresh = feedQuery.isFetching && !feedQuery.isLoading && !!feedQuery.data;

  return (
    <>
      <PageHeader
        title="Dispatch"
        description="Timeline opérationnelle — flux unifié AuditLog et incidents (polling 30s)"
      />

      <DispatchStickySummary data={sticky} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ActivityFilters availableTypes={availableTypes} />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void handleManualRefresh()}
          isLoading={feedQuery.isFetching}
          disabled={refreshCooldown || feedQuery.isFetching}
        >
          <RefreshCw className="h-4 w-4" />
          Rafraîchir
        </Button>
      </div>

      {isInitialLoading ? <TableSkeleton rows={5} columns={1} /> : null}

      {feedQuery.isError && !feedQuery.data ? (
        <ErrorState
          message={
            feedQuery.error instanceof ApiError
              ? feedQuery.error.message
              : "Impossible de charger le flux dispatch"
          }
          onRetry={() => void feedQuery.refetch()}
        />
      ) : null}

      {showEmpty ? (
        <EmptyState
          badge="Aucune activité"
          title="Aucune activité opérationnelle récente"
          description="Créez un incident ou effectuez une action admin pour alimenter le flux."
          action={
            <Button variant="secondary" size="sm" onClick={() => void handleManualRefresh()}>
              Rafraîchir
            </Button>
          }
        />
      ) : null}

      {showFeed ? (
        <>
          <ActivityFeedList events={events} isRefreshing={isStaleRefresh} />
          <LoadMoreButton
            onClick={() => void feedQuery.fetchNextPage()}
            isLoading={feedQuery.isFetchingNextPage}
            hasMore={hasMore}
            loadedCount={events.length}
            total={lastPage?.total}
          />
        </>
      ) : null}
    </>
  );
}
