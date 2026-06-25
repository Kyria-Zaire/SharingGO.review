import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Ticket } from "lucide-react";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/cn";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { BookingCardDesktop } from "@/features/bookings/components/booking-card/BookingCardDesktop";
import { BookingCardMobile } from "@/features/bookings/components/booking-card/BookingCardMobile";
import { BookingsEmptyState } from "@/features/bookings/components/BookingsEmptyState";
import { BookingsFilterTabs } from "@/features/bookings/components/BookingsFilterTabs";
import { BookingsHeroSection } from "@/features/bookings/components/BookingsHeroSection";
import { BookingsListSkeleton } from "@/features/bookings/components/BookingsListSkeleton";
import { BookingsSectionHeader } from "@/features/bookings/components/BookingsSectionHeader";
import { BookingsSortSheet } from "@/features/bookings/components/BookingsSortSheet";
import {
  defaultBookingsSort,
  sortBookings,
  type BookingsSortOption,
} from "@/features/bookings/lib/bookings-sort";
import { useBookingsTabCounts } from "@/hooks/useBookingsTabCounts";
import { type BookingsFilter, useUserReservations } from "@/hooks/useUserReservations";

const EMPTY_ICONS = {
  upcoming: CalendarDays,
  past: Ticket,
  canceled: Ticket,
} as const;

export function BookingsPage() {
  const [filter, setFilter] = useState<BookingsFilter>("upcoming");
  const [sort, setSort] = useState<BookingsSortOption>(() => defaultBookingsSort("upcoming"));
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  const reservationsQuery = useUserReservations(filter);
  const tabCounts = useBookingsTabCounts();

  useEffect(() => {
    setSort(defaultBookingsSort(filter));
  }, [filter]);

  const errorMessage = formatUserFacingError(
    reservationsQuery.error,
    USER_MESSAGES.reservationsLoad
  );

  const reservations = useMemo(() => {
    const items = reservationsQuery.data?.reservations ?? [];
    return sortBookings(items, sort);
  }, [reservationsQuery.data?.reservations, sort]);

  const isEmpty = !reservationsQuery.isPending && reservations.length === 0;
  const EmptyIcon = EMPTY_ICONS[filter];
  const sectionCount = tabCounts[filter] ?? reservations.length;

  return (
    <div className="w-full">
      <BookingsHeroSection />

      <div className={landingContainerClass}>
        <div
          className={cn(
            "relative z-20 -mt-4 sm:-mt-10 lg:-mt-12",
            "pb-8 pt-0 lg:pb-12"
          )}
        >
          <BookingsFilterTabs value={filter} onChange={setFilter} />

          {!reservationsQuery.isPending && !reservationsQuery.isError && reservations.length > 0 ? (
            <BookingsSectionHeader
              filter={filter}
              count={sectionCount}
              sort={sort}
              onSortChange={setSort}
              onOpenMobileSort={() => setSortSheetOpen(true)}
            />
          ) : null}

          {reservationsQuery.isPending ? <BookingsListSkeleton /> : null}

          {reservationsQuery.isError ? (
            <div className="pt-6">
              <ErrorState
                message={errorMessage}
                onRetry={() => void reservationsQuery.refetch()}
              />
            </div>
          ) : null}

          {!reservationsQuery.isPending && !reservationsQuery.isError && isEmpty ? (
            <div className="pt-6">
              <BookingsEmptyState
                filter={filter}
                icon={<EmptyIcon className="h-7 w-7" aria-hidden />}
              />
            </div>
          ) : null}

          {!reservationsQuery.isPending && !reservationsQuery.isError && reservations.length > 0 ? (
            <ul className="mt-5 space-y-4" aria-label="Liste des réservations">
              {reservations.map((reservation) => (
                <li key={reservation.id}>
                  <BookingCardDesktop reservation={reservation} filter={filter} />
                  <BookingCardMobile reservation={reservation} filter={filter} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <BookingsSortSheet
        open={sortSheetOpen}
        sort={sort}
        onClose={() => setSortSheetOpen(false)}
        onSortChange={setSort}
      />
    </div>
  );
}
