import type { PassengerUser } from "@/types/auth";

export interface BookingPassengerFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  termsAccepted: boolean;
}

export function buildInitialPassengerForm(user: PassengerUser | null): BookingPassengerFormState {
  return {
    firstName: user?.firstName?.trim() ?? "",
    lastName: user?.lastName?.trim() ?? "",
    email: user?.email?.trim() ?? "",
    phone: "",
    termsAccepted: false,
  };
}

export function canSubmitBookingForm(form: BookingPassengerFormState): boolean {
  return form.termsAccepted && form.email.trim().length > 0;
}
