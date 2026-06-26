import { Link } from "react-router-dom";
import { Luggage, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/types/routes";
import {
  BOOKING_FORM_LUGGAGE_OPTION,
  BOOKING_FORM_OPTIONS_SECTION_TITLE,
  BOOKING_FORM_PASSENGER_SECTION_TITLE,
  BOOKING_FORM_PHONE_LABEL,
  BOOKING_FORM_PHONE_PLACEHOLDER,
  BOOKING_FORM_SEATS_LABEL,
  BOOKING_FORM_SEATS_VALUE,
} from "@/features/booking-form/constants/booking-form-content";
import type { BookingPassengerFormState } from "@/features/booking-form/lib/booking-form-passenger";

const SECTION_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] sm:p-5";

export function BookingFormPassengerSection({
  form,
  onChange,
}: {
  form: BookingPassengerFormState;
  onChange: (patch: Partial<BookingPassengerFormState>) => void;
}) {
  return (
    <section className={SECTION_CLASS} aria-labelledby="booking-form-passenger-title">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h2 id="booking-form-passenger-title" className="text-sm font-semibold text-foreground">
          {BOOKING_FORM_PASSENGER_SECTION_TITLE}
        </h2>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Prénom"
          name="firstName"
          autoComplete="given-name"
          value={form.firstName}
          onChange={(event) => onChange({ firstName: event.target.value })}
        />
        <Input
          label="Nom"
          name="lastName"
          autoComplete="family-name"
          value={form.lastName}
          onChange={(event) => onChange({ lastName: event.target.value })}
        />
        <div className="sm:col-span-2">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) => onChange({ email: event.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label={BOOKING_FORM_PHONE_LABEL}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder={BOOKING_FORM_PHONE_PLACEHOLDER}
            value={form.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
          />
        </div>
      </div>
    </section>
  );
}

export function BookingFormOptionsSection() {
  return (
    <section className={SECTION_CLASS} aria-labelledby="booking-form-options-title">
      <div className="flex items-center gap-2">
        <Luggage className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h2 id="booking-form-options-title" className="text-sm font-semibold text-foreground">
          {BOOKING_FORM_OPTIONS_SECTION_TITLE}
        </h2>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-start justify-between gap-3">
          <dt className="text-foreground">Bagages</dt>
          <dd className="text-right font-medium text-muted-foreground">
            {BOOKING_FORM_LUGGAGE_OPTION}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3 border-t border-white/[0.06] pt-3">
          <dt className="text-foreground">{BOOKING_FORM_SEATS_LABEL}</dt>
          <dd className="font-semibold text-foreground">{BOOKING_FORM_SEATS_VALUE}</dd>
        </div>
      </dl>
    </section>
  );
}

export function BookingFormTermsSection({
  accepted,
  onChange,
}: {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
}) {
  return (
    <section className={SECTION_CLASS}>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onChange(event.target.checked)}
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-background",
            "text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        />
        <span className="text-sm leading-relaxed text-foreground">
          J&apos;accepte les{" "}
          <Link
            to={ROUTES.legalTerms}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Conditions Générales de Vente
          </Link>{" "}
          et la{" "}
          <Link
            to={ROUTES.legalPrivacy}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Politique de confidentialité
          </Link>
          .
        </span>
      </label>
    </section>
  );
}
