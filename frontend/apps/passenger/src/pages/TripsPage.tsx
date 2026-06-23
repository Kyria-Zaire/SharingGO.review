import { useState } from "react";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  SUBSCRIPTION_COMING_SOON,
  TICKET_PRICE_NOTE,
} from "@/constants/pricing";
import { TripsDateFilter } from "@/features/trips/components/TripsDateFilter";
import { TripsList, TripsListSkeleton } from "@/features/trips/components/TripsList";
import { TripsRouteSummary } from "@/features/trips/components/TripsRouteSummary";
import { TripsTrustBlock } from "@/features/trips/components/TripsTrustBlock";
import { usePublicTrips } from "@/hooks/usePublicTrips";
import { todayParisDateKey } from "@/lib/format-date";
import type { TripsDateFilterValue } from "@/types/trips.types";

export function TripsPage() {
  const [dateFilter, setDateFilter] = useState<TripsDateFilterValue>(() => ({
    preset: "today",
    dateKey: todayParisDateKey(),
  }));

  const tripsQuery = usePublicTrips(dateFilter);
  const trips = tripsQuery.data?.trips ?? [];
  const primaryLine = trips[0]?.line;

  const errorMessage = formatUserFacingError(tripsQuery.error, USER_MESSAGES.tripsLoad);

  return (
    <>
      <PageHeader
        title="Trajets"
        description="Horaires et places disponibles — Châlons-en-Champagne ↔ Paris-Vatry"
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <aside className="mb-5 space-y-5 lg:mb-0 lg:sticky lg:top-[calc(3.5rem+1.25rem)] lg:self-start">
          <TripsRouteSummary line={primaryLine} />

          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{TICKET_PRICE_NOTE}</p>
            <p className="mt-1 text-muted-foreground">{SUBSCRIPTION_COMING_SOON}</p>
          </div>

          <TripsTrustBlock />
        </aside>

        <div className="min-w-0">
          <TripsDateFilter value={dateFilter} onChange={setDateFilter} />

          {tripsQuery.isLoading ? <TripsListSkeleton /> : null}

          {tripsQuery.isError ? (
            <ErrorState message={errorMessage} onRetry={() => void tripsQuery.refetch()} />
          ) : null}

          {!tripsQuery.isLoading && !tripsQuery.isError && trips.length === 0 ? (
            <EmptyState
              badge="Aucun trajet"
              title="Aucun trajet disponible"
              description="Essayez une autre date ou revenez plus tard."
              action={
                <button
                  type="button"
                  className="text-sm font-medium text-primary"
                  onClick={() => void tripsQuery.refetch()}
                >
                  Actualiser
                </button>
              }
            />
          ) : null}

          {!tripsQuery.isLoading && !tripsQuery.isError && trips.length > 0 ? (
            <TripsList trips={trips} />
          ) : null}
        </div>
      </div>
    </>
  );
}
