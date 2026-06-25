import { Button } from "@/components/ui/Button";
import { landingPrimaryButtonClass } from "@/features/home/lib/landing-layout";
import { BookingFormHeader, BookingFormStepIndicator } from "@/features/booking-form/components/BookingFormStepIndicator";
import {
  BookingFormOptionsSection,
  BookingFormPassengerSection,
  BookingFormTermsSection,
} from "@/features/booking-form/components/BookingFormSections";
import {
  BookingFormMobilePriceSummary,
  BookingFormMobileTripSummary,
  BookingFormSummarySidebar,
} from "@/features/booking-form/components/BookingFormSummarySidebar";
import {
  BOOKING_FORM_SUBMIT_CTA,
  BOOKING_FORM_SUBMIT_LOADING,
} from "@/features/booking-form/constants/booking-form-content";
import {
  canSubmitBookingForm,
  type BookingPassengerFormState,
} from "@/features/booking-form/lib/booking-form-passenger";
import { cn } from "@/lib/cn";
import type { PublicTrip } from "@/types/trips.types";

export function BookingFormView({
  trip,
  form,
  onFormChange,
  onSubmit,
  isSubmitting,
  errorMessage,
}: {
  trip: PublicTrip;
  form: BookingPassengerFormState;
  onFormChange: (patch: Partial<BookingPassengerFormState>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}) {
  const canSubmit = canSubmitBookingForm(form) && !isSubmitting;

  return (
    <div className="space-y-5 pb-8 lg:space-y-6 lg:pb-12">
      <BookingFormHeader tripId={trip.id} />
      <BookingFormStepIndicator />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4 lg:space-y-5">
          <BookingFormMobileTripSummary trip={trip} />

          <BookingFormPassengerSection
            form={form}
            onChange={onFormChange}
          />

          <BookingFormOptionsSection />

          <BookingFormTermsSection
            accepted={form.termsAccepted}
            onChange={(termsAccepted) => onFormChange({ termsAccepted })}
          />

          <BookingFormMobilePriceSummary />

          <div className="space-y-3 lg:hidden">
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className={cn(
                landingPrimaryButtonClass,
                "w-full px-6 py-3.5 text-base font-bold",
                !canSubmit && "cursor-not-allowed opacity-60"
              )}
            >
              {isSubmitting ? BOOKING_FORM_SUBMIT_LOADING : BOOKING_FORM_SUBMIT_CTA}
            </button>
            {errorMessage ? (
              <p className="text-center text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>

        <div className="hidden lg:block">
          <BookingFormSummarySidebar trip={trip} />
          <div className="mt-4 space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canSubmit}
              isLoading={isSubmitting}
              onClick={onSubmit}
            >
              {isSubmitting ? BOOKING_FORM_SUBMIT_LOADING : BOOKING_FORM_SUBMIT_CTA}
            </Button>
            {errorMessage ? (
              <p className="text-center text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
