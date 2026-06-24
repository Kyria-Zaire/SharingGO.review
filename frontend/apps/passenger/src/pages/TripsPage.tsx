import { useCallback, useMemo, useRef, useState } from "react";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { TripsFiltersSheet } from "@/features/trips/components/TripsFiltersSheet";
import { TripsHeroSection } from "@/features/trips/components/TripsHeroSection";
import { TripsHowItWorksSection } from "@/features/trips/components/TripsHowItWorksSection";
import { TripsList, TripsListSkeleton } from "@/features/trips/components/TripsList";
import { TripsListToolbar } from "@/features/trips/components/TripsListToolbar";
import { TripsQuickFilters } from "@/features/trips/components/TripsQuickFilters";
import { TripsReassuranceSection } from "@/features/trips/components/TripsReassuranceSection";
import {
  applyTripsClientFilters,
  countActiveClientFilters,
  DEFAULT_TRIPS_CLIENT_FILTERS,
  swapDirection,
  type TripsClientFilters,
} from "@/features/trips/lib/trips-filters";
import { nextTripDateKey, useNextAvailableTrip } from "@/hooks/useNextAvailableTrip";
import { usePublicTrips } from "@/hooks/usePublicTrips";
import { todayParisDateKey } from "@/lib/format-date";
import type { TripsDateFilterValue } from "@/types/trips.types";

export function TripsPage() {
  const resultsRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [dateFilter, setDateFilter] = useState<TripsDateFilterValue>(() => ({
    preset: "today",
    dateKey: todayParisDateKey(),
  }));

  const [clientFilters, setClientFilters] = useState<TripsClientFilters>(
    DEFAULT_TRIPS_CLIENT_FILTERS
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const nextTripQuery = useNextAvailableTrip();
  const nextDepartureDateKey = nextTripDateKey(nextTripQuery.data);

  const tripsQuery = usePublicTrips(dateFilter);

  const filteredTrips = useMemo(() => {
    const allTrips = tripsQuery.data?.trips ?? [];
    return applyTripsClientFilters(allTrips, clientFilters);
  }, [tripsQuery.data?.trips, clientFilters]);

  const errorMessage = formatUserFacingError(tripsQuery.error, USER_MESSAGES.tripsLoad);
  const activeFiltersCount = countActiveClientFilters(clientFilters);

  const scrollToResults = useCallback(() => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  function handleSearch() {
    setDateFilter((current) => ({ ...current, dateKey: current.dateKey }));
    void tripsQuery.refetch();
    scrollToResults();
  }

  function handleDateKeyChange(dateKey: string) {
    setDateFilter({ preset: "custom", dateKey });
  }

  function handleDirectionChange(direction: TripsClientFilters["direction"]) {
    setClientFilters((current) => ({ ...current, direction }));
  }

  function handleSwapDirection() {
    setClientFilters((current) => ({
      ...current,
      direction: swapDirection(current.direction),
    }));
  }

  function handleOpenDatePicker() {
    setDateFilter((current) => ({ preset: "custom", dateKey: current.dateKey }));
    dateInputRef.current?.showPicker?.();
    dateInputRef.current?.focus();
  }

  function handleResetFilters() {
    setClientFilters(DEFAULT_TRIPS_CLIENT_FILTERS);
  }

  return (
    <div className="w-full">
      <TripsHeroSection
        direction={clientFilters.direction}
        dateKey={dateFilter.dateKey}
        onDirectionChange={handleDirectionChange}
        onDateChange={handleDateKeyChange}
        onSwapDirection={handleSwapDirection}
        onSearch={handleSearch}
      />

      <div className={landingContainerClass}>
        <div className="space-y-3 pb-8 pt-5 lg:space-y-5 lg:pb-12 lg:pt-8">
          <TripsQuickFilters
            value={dateFilter}
            nextDepartureDateKey={nextDepartureDateKey}
            onChange={setDateFilter}
            onOpenDatePicker={handleOpenDatePicker}
          />

          <input
            ref={dateInputRef}
            type="date"
            value={dateFilter.dateKey}
            min={todayParisDateKey()}
            onChange={(event) =>
              setDateFilter({
                preset: "custom",
                dateKey: event.target.value || todayParisDateKey(),
              })
            }
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />

          <div ref={resultsRef} className="scroll-mt-24 space-y-3 lg:space-y-4">
            <TripsListToolbar
              tripCount={filteredTrips.length}
              sort={clientFilters.sort}
              activeFiltersCount={activeFiltersCount}
              onSortChange={(sort) => setClientFilters((current) => ({ ...current, sort }))}
              onOpenFilters={() => setFiltersOpen(true)}
            />

            {tripsQuery.isLoading ? <TripsListSkeleton /> : null}

            {tripsQuery.isError ? (
              <ErrorState message={errorMessage} onRetry={() => void tripsQuery.refetch()} />
            ) : null}

            {!tripsQuery.isLoading && !tripsQuery.isError && filteredTrips.length === 0 ? (
              <EmptyState
                badge="Aucun trajet"
                title="Aucun trajet disponible"
                description="Essayez une autre date, un autre sens ou ajustez vos filtres."
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

            {!tripsQuery.isLoading && !tripsQuery.isError && filteredTrips.length > 0 ? (
              <TripsList trips={filteredTrips} />
            ) : null}
          </div>
        </div>
      </div>

      <TripsHowItWorksSection />
      <TripsReassuranceSection />

      <TripsFiltersSheet
        open={filtersOpen}
        filters={clientFilters}
        onChange={setClientFilters}
        onClose={() => setFiltersOpen(false)}
        onApply={scrollToResults}
        onReset={handleResetFilters}
      />
    </div>
  );
}
