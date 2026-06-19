import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { listAdminActivityFeed } from "@/api/admin-activity.api";
import { ApiError } from "@/api/http";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { queryKeys } from "@/constants/query-keys";
import { ActivityFeedCard } from "@/features/activity/components/ActivityFeedCard";
import type { ActivityFeedFilters, ActivityFeedSeverity } from "@/types/incidents.types";

const ACTIVITY_STALE_MS = 30_000;
const POLL_MS = 30_000;

export function ActivityPage() {
  const [filters, setFilters] = useState<ActivityFeedFilters>({ limit: 50, offset: 0 });
  const [severityFilter, setSeverityFilter] = useState<ActivityFeedSeverity | "all">("all");
  const [enablePoll, setEnablePoll] = useState(true);

  const queryFilters: ActivityFeedFilters = {
    ...filters,
    severity: severityFilter === "all" ? undefined : severityFilter,
  };

  const filterKey = { ...queryFilters } as Record<string, unknown>;

  const feedQuery = useQuery({
    queryKey: queryKeys.activity.feed(filterKey),
    queryFn: () => listAdminActivityFeed(queryFilters),
    staleTime: ACTIVITY_STALE_MS,
    refetchInterval: enablePoll ? POLL_MS : false,
  });

  const events = feedQuery.data?.events ?? [];

  useEffect(() => {
    setFilters((current) => ({ ...current, offset: 0 }));
  }, [severityFilter]);

  return (
    <>
      <PageHeader
        title="Activité"
        description="Flux opérationnel unifié — AuditLog et incidents persistés"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <select
          value={severityFilter}
          onChange={(event) =>
            setSeverityFilter(event.target.value as ActivityFeedSeverity | "all")
          }
          className="flex h-10 w-full min-w-0 rounded-md border border-border bg-background px-3 text-sm sm:w-auto sm:min-w-[12rem]"
        >
          <option value="all">Toutes sévérités</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={enablePoll}
            onChange={(event) => setEnablePoll(event.target.checked)}
            className="accent-primary"
          />
          Polling 30s
        </label>
        <Button
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => feedQuery.refetch()}
          isLoading={feedQuery.isFetching}
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {feedQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement du flux…</p>
      ) : null}

      {feedQuery.isError ? (
        <ErrorState
          message={
            feedQuery.error instanceof ApiError
              ? feedQuery.error.message
              : "Impossible de charger le flux d'activité"
          }
          onRetry={() => feedQuery.refetch()}
        />
      ) : null}

      {!feedQuery.isLoading && !feedQuery.isError && events.length === 0 ? (
        <EmptyState
          badge="Aucune activité"
          title="Aucun événement opérationnel"
          description="Les actions admin, incidents et audit apparaîtront ici."
        />
      ) : null}

      {!feedQuery.isLoading && !feedQuery.isError && events.length > 0 ? (
        <div className="space-y-3" data-activity-feed>
          {events.map((event) => (
            <ActivityFeedCard key={event.id} event={event} />
          ))}
        </div>
      ) : null}
    </>
  );
}
