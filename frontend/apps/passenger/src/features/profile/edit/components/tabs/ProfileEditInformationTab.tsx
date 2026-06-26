import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { PROFILE_EDIT_INFORMATION } from "@/features/profile/edit/constants/profile-edit-content";
import {
  isGoogleOAuthSession,
  profileEditInputClass,
  profileEditInputReadOnlyClass,
} from "@/features/profile/edit/lib/profile-edit-form";
import type { PassengerUser } from "@/types/auth";

const CARD_CLASS = cn(landingCardClass, "border-white/[0.08] bg-[#121212] p-5 sm:p-6");

function FieldLabel({
  htmlFor,
  label,
  hint,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {label}
      {hint ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">({hint})</span> : null}
    </label>
  );
}

export function ProfileEditInformationTab({ user }: { user: PassengerUser }) {
  const isGoogle = isGoogleOAuthSession();
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
  }, [user.firstName, user.lastName]);

  return (
    <article className={cn(CARD_CLASS, "mt-6")} aria-label={PROFILE_EDIT_INFORMATION.title}>
      <h2 className="text-lg font-semibold text-foreground">{PROFILE_EDIT_INFORMATION.title}</h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="edit-first-name" label={PROFILE_EDIT_INFORMATION.firstName} />
          <input
            id="edit-first-name"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={profileEditInputClass}
          />
        </div>

        <div>
          <FieldLabel htmlFor="edit-last-name" label={PROFILE_EDIT_INFORMATION.lastName} />
          <input
            id="edit-last-name"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={profileEditInputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="edit-email" label={PROFILE_EDIT_INFORMATION.email} />
          <input
            id="edit-email"
            type="email"
            autoComplete="email"
            value={user.email}
            readOnly
            className={profileEditInputReadOnlyClass}
            aria-describedby={isGoogle ? "edit-email-hint" : undefined}
          />
          {isGoogle ? (
            <p id="edit-email-hint" className="mt-1.5 text-xs text-muted-foreground">
              {PROFILE_EDIT_INFORMATION.emailGoogleHint}
            </p>
          ) : null}
        </div>

        <div>
          <FieldLabel
            htmlFor="edit-phone"
            label={PROFILE_EDIT_INFORMATION.phone}
            hint={PROFILE_EDIT_INFORMATION.optionalHint}
          />
          <input
            id="edit-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={PROFILE_EDIT_INFORMATION.notProvided}
            className={profileEditInputClass}
          />
        </div>

        <div>
          <FieldLabel
            htmlFor="edit-birth-date"
            label={PROFILE_EDIT_INFORMATION.birthDate}
            hint={PROFILE_EDIT_INFORMATION.optionalHint}
          />
          <input
            id="edit-birth-date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={profileEditInputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <FieldLabel
            htmlFor="edit-address"
            label={PROFILE_EDIT_INFORMATION.address}
            hint={PROFILE_EDIT_INFORMATION.optionalHint}
          />
          <input
            id="edit-address"
            type="text"
            autoComplete="street-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={PROFILE_EDIT_INFORMATION.notProvided}
            className={profileEditInputClass}
          />
        </div>

        <div>
          <FieldLabel
            htmlFor="edit-postal-code"
            label={PROFILE_EDIT_INFORMATION.postalCode}
            hint={PROFILE_EDIT_INFORMATION.optionalHint}
          />
          <input
            id="edit-postal-code"
            type="text"
            autoComplete="postal-code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder={PROFILE_EDIT_INFORMATION.notProvided}
            className={profileEditInputClass}
          />
        </div>

        <div>
          <FieldLabel
            htmlFor="edit-city"
            label={PROFILE_EDIT_INFORMATION.city}
            hint={PROFILE_EDIT_INFORMATION.optionalHint}
          />
          <input
            id="edit-city"
            type="text"
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={PROFILE_EDIT_INFORMATION.notProvided}
            className={profileEditInputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <FieldLabel
            htmlFor="edit-country"
            label={PROFILE_EDIT_INFORMATION.country}
            hint={PROFILE_EDIT_INFORMATION.optionalHint}
          />
          <input
            id="edit-country"
            type="text"
            autoComplete="country-name"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder={PROFILE_EDIT_INFORMATION.notProvided}
            className={profileEditInputClass}
          />
        </div>
      </div>
    </article>
  );
}
