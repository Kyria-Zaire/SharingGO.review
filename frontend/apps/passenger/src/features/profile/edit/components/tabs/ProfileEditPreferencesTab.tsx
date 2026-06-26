import { useState } from "react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { ProfileEditToggle } from "@/features/profile/edit/components/ProfileEditToggle";
import { PROFILE_EDIT_PREFERENCES } from "@/features/profile/edit/constants/profile-edit-content";
import { profileEditInputReadOnlyClass } from "@/features/profile/edit/lib/profile-edit-form";

const CARD_CLASS = cn(landingCardClass, "border-white/[0.08] bg-[#121212] p-5 sm:p-6");

export function ProfileEditPreferencesTab() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [offers, setOffers] = useState(false);

  return (
    <article className={cn(CARD_CLASS, "mt-6 max-w-2xl")} aria-label={PROFILE_EDIT_PREFERENCES.title}>
      <h2 className="text-lg font-semibold text-foreground">{PROFILE_EDIT_PREFERENCES.title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{PROFILE_EDIT_PREFERENCES.localStateHint}</p>

      <div className="mt-6 space-y-4">
        <ProfileEditToggle
          id="pref-email"
          label={PROFILE_EDIT_PREFERENCES.emailNotifications}
          checked={emailNotifications}
          onChange={setEmailNotifications}
        />
        <ProfileEditToggle
          id="pref-sms"
          label={PROFILE_EDIT_PREFERENCES.smsNotifications}
          checked={smsNotifications}
          onChange={setSmsNotifications}
        />
        <ProfileEditToggle
          id="pref-offers"
          label={PROFILE_EDIT_PREFERENCES.offers}
          checked={offers}
          onChange={setOffers}
        />

        <div className="rounded-xl border border-white/[0.06] bg-[#161616] p-4">
          <label htmlFor="pref-language" className="text-sm font-medium text-foreground">
            {PROFILE_EDIT_PREFERENCES.language}
          </label>
          <input
            id="pref-language"
            type="text"
            readOnly
            value={PROFILE_EDIT_PREFERENCES.languageValue}
            className={profileEditInputReadOnlyClass}
          />
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#161616] p-4">
          <label htmlFor="pref-distance" className="text-sm font-medium text-foreground">
            {PROFILE_EDIT_PREFERENCES.distanceUnit}
          </label>
          <input
            id="pref-distance"
            type="text"
            readOnly
            value={PROFILE_EDIT_PREFERENCES.distanceValue}
            className={profileEditInputReadOnlyClass}
          />
        </div>
      </div>
    </article>
  );
}
