import { TripCardMobile } from "@/features/trips/components/TripCardMobile";
import { TripListRow } from "@/features/trips/components/TripListRow";
import type { PublicTrip } from "@/types/trips.types";

export function TripsList({ trips }: { trips: PublicTrip[] }) {
  return (
    <ul className="space-y-3 lg:space-y-4" aria-label="Liste des trajets">
      {trips.map((trip, index) => (
        <li key={trip.id}>
          <div className="lg:hidden">
            <TripCardMobile trip={trip} />
          </div>
          <div className="hidden lg:block">
            <TripListRow trip={trip} highlighted={index === 0} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TripsListSkeleton() {
  return (
    <div className="space-y-3 lg:space-y-4" aria-busy="true" aria-label="Chargement des trajets">
      {[1, 2, 3].map((key) => (
        <div
          key={key}
          className="h-36 animate-pulse rounded-2xl border border-white/[0.06] bg-[#1a1d23]/60 lg:h-28"
        />
      ))}
    </div>
  );
}
