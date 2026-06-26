import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";
import { BookingCardDesktop } from "@/features/bookings/components/booking-card/BookingCardDesktop";
import { BookingCardMobile } from "@/features/bookings/components/booking-card/BookingCardMobile";
import { landingCardClass, landingOutlineButtonClass } from "@/features/home/lib/landing-layout";
import { PROFILE_ACTIVITY } from "@/features/profile/constants/profile-content";
import type { UserReservationListItem } from "@/types/reservations";
import { ROUTES } from "@/types/routes";

const EMPTY_CLASS = cn(
  landingCardClass,
  "flex flex-col items-center bg-[#161616] px-6 py-10 text-center"
);

export function ProfileRecentActivitySection({
  reservations,
}: {
  reservations: UserReservationListItem[];
}) {
  return (
    <section aria-labelledby="profile-activity-title">
      <h2 id="profile-activity-title" className="text-base font-semibold text-foreground">
        {PROFILE_ACTIVITY.title}
      </h2>

      {reservations.length === 0 ? (
        <div className={cn(EMPTY_CLASS, "mt-4")}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#121212] text-primary">
            <CalendarDays className="h-7 w-7" aria-hidden />
          </div>
          <p className="mt-4 text-lg font-semibold text-foreground">{PROFILE_ACTIVITY.emptyTitle}</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {PROFILE_ACTIVITY.emptyDescription}
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-4 space-y-4" aria-label="Réservations récentes">
            {reservations.map((reservation) => (
              <li key={reservation.id}>
                <BookingCardDesktop reservation={reservation} filter="past" />
                <BookingCardMobile reservation={reservation} filter="past" />
              </li>
            ))}
          </ul>

          <Link
            to={ROUTES.bookings}
            className={cn(landingOutlineButtonClass, "mt-6 inline-flex w-full sm:w-auto")}
          >
            {PROFILE_ACTIVITY.viewAllCta}
          </Link>
        </>
      )}
    </section>
  );
}
