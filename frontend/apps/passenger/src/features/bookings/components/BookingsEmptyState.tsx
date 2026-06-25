import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { landingCardClass, landingPrimaryButtonClass } from "@/features/home/lib/landing-layout";
import { ROUTES } from "@/types/routes";
import type { BookingsFilter } from "@/hooks/useUserReservations";

const EMPTY_COPY: Record<
  BookingsFilter,
  { title: string; description: string; showTripsCta: boolean }
> = {
  upcoming: {
    title: "Aucune réservation à venir",
    description: "Réservez votre prochain trajet sur la ligne Châlons ↔ Vatry.",
    showTripsCta: true,
  },
  past: {
    title: "Aucune réservation passée",
    description: "Vos trajets terminés apparaîtront ici après votre embarquement.",
    showTripsCta: false,
  },
  canceled: {
    title: "Aucune réservation annulée",
    description: "Les réservations annulées seront listées dans cet onglet.",
    showTripsCta: false,
  },
};

export interface BookingsEmptyStateProps {
  filter: BookingsFilter;
  icon: ReactNode;
}

export function BookingsEmptyState({ filter, icon }: BookingsEmptyStateProps) {
  const copy = EMPTY_COPY[filter];

  return (
    <div
      className={cn(
        landingCardClass,
        "flex flex-col items-center bg-[#161616] px-6 py-12 text-center sm:py-14"
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#121212] text-primary">
        {icon}
      </div>
      <h2 className="mt-5 text-lg font-semibold text-foreground">{copy.title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {copy.description}
      </p>
      {copy.showTripsCta ? (
        <Link to={ROUTES.trips} className={cn(landingPrimaryButtonClass, "mt-6")}>
          Voir les trajets
        </Link>
      ) : null}
    </div>
  );
}
