import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "@/api/http";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { BookingFormSkeleton } from "@/features/booking-form/components/BookingFormSkeleton";
import { BookingFormView } from "@/features/booking-form/components/BookingFormView";
import {
  BOOKING_FORM_UNAVAILABLE_MESSAGE,
  BOOKING_FORM_UNAVAILABLE_TITLE,
} from "@/features/booking-form/constants/booking-form-content";
import {
  buildInitialPassengerForm,
  type BookingPassengerFormState,
} from "@/features/booking-form/lib/booking-form-passenger";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePendingReservation } from "@/hooks/useCreatePendingReservation";
import { usePublicTrip } from "@/hooks/usePublicTrip";
import { useTripIdParam } from "@/hooks/useTripIdParam";
import { deriveTripDetailReservationCta } from "@/lib/trip-availability";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import { ROUTES } from "@/types/routes";

export function BookingFormPage() {
  const tripId = useTripIdParam();
  const tripQuery = usePublicTrip(tripId);
  const { user } = useAuth();
  const { createPending, isPending, errorMessage, reset } = useCreatePendingReservation();

  const [form, setForm] = useState<BookingPassengerFormState>(() =>
    buildInitialPassengerForm(user)
  );

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      firstName: current.firstName || user.firstName?.trim() || "",
      lastName: current.lastName || user.lastName?.trim() || "",
      email: current.email || user.email?.trim() || "",
    }));
  }, [user]);

  const isNotFound =
    tripQuery.error instanceof ApiError && tripQuery.error.code === "TRIP_NOT_FOUND";

  const errorMessageTrip = isNotFound
    ? USER_MESSAGES.tripNotFound
    : formatUserFacingError(tripQuery.error, USER_MESSAGES.tripLoad);

  const showSkeleton = tripQuery.isPending && !tripQuery.data;
  const trip = tripQuery.data;

  const reservationCta = trip ? deriveTripDetailReservationCta(trip) : null;
  const isUnavailable = Boolean(trip && reservationCta?.disabled);

  const handleSubmit = () => {
    if (!tripId || !trip || isUnavailable || isPending) return;
    reset();
    createPending(tripId);
  };

  const handleFormChange = (patch: Partial<BookingPassengerFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  if (!tripId) {
    return (
      <div className={landingContainerClass}>
        <ErrorState message={USER_MESSAGES.tripIdMissing} />
      </div>
    );
  }

  if (showSkeleton) {
    return (
      <div className={landingContainerClass}>
        <BookingFormSkeleton />
      </div>
    );
  }

  if (tripQuery.isError) {
    return (
      <div className={landingContainerClass}>
        <div className="space-y-4 py-4">
          <ErrorState
            message={errorMessageTrip}
            onRetry={isNotFound ? undefined : () => void tripQuery.refetch()}
          />
          <Link
            to={ROUTES.trips}
            className="inline-flex min-h-touch items-center text-sm font-medium text-primary"
          >
            ← Retour aux trajets
          </Link>
        </div>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  if (isUnavailable) {
    return (
      <div className={landingContainerClass}>
        <div className="space-y-4 py-6">
          <ErrorState
            message={`${BOOKING_FORM_UNAVAILABLE_TITLE}. ${BOOKING_FORM_UNAVAILABLE_MESSAGE}`}
          />
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => window.history.back()}>
              Retour
            </Button>
            <Link
              to={ROUTES.trips}
              className="inline-flex min-h-touch items-center text-sm font-medium text-primary"
            >
              Voir les trajets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={landingContainerClass}>
      <BookingFormView
        trip={trip}
        form={form}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        errorMessage={errorMessage}
      />
    </div>
  );
}
