import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/types/routes";
import type { UserReservationDetail } from "@/types/reservations";
import { BookingDetailHeader } from "./BookingDetailHeader";
import { BookingDetailHistorySection } from "./BookingDetailHistorySection";
import { BookingDetailMetaGrid } from "./BookingDetailMetaGrid";
import { BookingDetailMobileSections } from "./BookingDetailMobileSections";
import { BookingDetailTripCard } from "./BookingDetailTripCard";

export function BookingDetailView({ reservation }: { reservation: UserReservationDetail }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPastTrip = new Date(reservation.trip.departureTime).getTime() < Date.now();
  const isUpcoming =
    !isPastTrip &&
    (reservation.status === "CONFIRMED" || reservation.status === "PENDING");
  const showQrAction = reservation.status === "CONFIRMED" && !isPastTrip;
  const canCancel = reservation.status === "CONFIRMED" && !isPastTrip;

  return (
    <div className="space-y-5 pb-8 lg:space-y-6 lg:pb-12">
      <BookingDetailHeader
        reservation={reservation}
        isPastTrip={isPastTrip}
        showQrAction={showQrAction}
        onViewQr={() => navigate(ROUTES.boardingPass(reservation.id))}
      />

      <BookingDetailTripCard reservation={reservation} isUpcoming={isUpcoming} />

      <BookingDetailMetaGrid user={user} />

      <BookingDetailMobileSections user={user} />

      <BookingDetailHistorySection reservation={reservation} canCancel={canCancel} />
    </div>
  );
}
