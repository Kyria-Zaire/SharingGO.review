import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { ApiError } from "@/api/http";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { BookingCard } from "@/features/bookings/components/BookingCard";
import { BookingsFilterTabs } from "@/features/bookings/components/BookingsFilterTabs";
import { type BookingsFilter, useUserReservations } from "@/hooks/useUserReservations";
import { ROUTES } from "@/types/routes";

function BookingsListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement des réservations">
      <div className="h-36 animate-pulse rounded-xl bg-muted" />
      <div className="h-36 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

const EMPTY_MESSAGES: Record<BookingsFilter, { title: string; description: string }> = {
  upcoming: {
    title: "Aucune réservation à venir",
    description: "Réservez un trajet pour le retrouver ici avant le départ.",
  },
  past: {
    title: "Aucune réservation passée",
    description: "Vos trajets terminés apparaîtront dans cet onglet.",
  },
  all: {
    title: "Aucune réservation",
    description: "Vos billets confirmés apparaîtront ici après paiement.",
  },
};

export function BookingsPage() {
  const [filter, setFilter] = useState<BookingsFilter>("upcoming");
  const reservationsQuery = useUserReservations(filter);

  const errorMessage =
    reservationsQuery.error instanceof ApiError
      ? reservationsQuery.error.message
      : reservationsQuery.error instanceof Error
        ? reservationsQuery.error.message
        : "Impossible de charger vos réservations.";

  const reservations = reservationsQuery.data?.reservations ?? [];
  const isEmpty = !reservationsQuery.isPending && reservations.length === 0;
  const emptyCopy = EMPTY_MESSAGES[filter];

  return (
    <>
      <PageHeader
        title="Mes réservations"
        description="Vos trajets confirmés sur la navette Sharing Go."
      />

      <BookingsFilterTabs value={filter} onChange={setFilter} />

      {reservationsQuery.isPending ? <BookingsListSkeleton /> : null}

      {reservationsQuery.isError ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => void reservationsQuery.refetch()}
        />
      ) : null}

      {!reservationsQuery.isPending && !reservationsQuery.isError && isEmpty ? (
        <EmptyState
          icon={<CalendarDays className="h-8 w-8" aria-hidden />}
          title={emptyCopy.title}
          description={emptyCopy.description}
          action={
            <Link
              to={ROUTES.trips}
              className="inline-flex min-h-touch items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Voir les trajets
            </Link>
          }
        />
      ) : null}

      {!reservationsQuery.isPending && !reservationsQuery.isError && reservations.length > 0 ? (
        <ul className="space-y-4" aria-label="Liste des réservations">
          {reservations.map((reservation) => (
            <li key={reservation.id}>
              <BookingCard reservation={reservation} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
