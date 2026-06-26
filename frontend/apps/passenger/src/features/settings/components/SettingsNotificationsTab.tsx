import { useState } from "react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { ProfileEditToggle } from "@/features/profile/edit/components/ProfileEditToggle";
import { SETTINGS_NOTIFICATIONS } from "@/features/settings/constants/settings-content";

const CARD_CLASS = cn(landingCardClass, "mt-6 border-white/[0.08] bg-[#121212] p-5 sm:p-6");

export function SettingsNotificationsTab() {
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [departures, setDepartures] = useState(true);
  const [promotions, setPromotions] = useState(false);

  return (
    <article className={CARD_CLASS} aria-label={SETTINGS_NOTIFICATIONS.title}>
      <h2 className="text-lg font-semibold text-foreground">{SETTINGS_NOTIFICATIONS.title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{SETTINGS_NOTIFICATIONS.syncHint}</p>

      <div className="mt-6 space-y-4">
        <ProfileEditToggle
          id="settings-notif-email"
          label={SETTINGS_NOTIFICATIONS.email}
          checked={email}
          onChange={setEmail}
        />
        <ProfileEditToggle
          id="settings-notif-sms"
          label={SETTINGS_NOTIFICATIONS.sms}
          checked={sms}
          onChange={setSms}
        />
        <ProfileEditToggle
          id="settings-notif-departures"
          label={SETTINGS_NOTIFICATIONS.departures}
          checked={departures}
          onChange={setDepartures}
        />
        <ProfileEditToggle
          id="settings-notif-promotions"
          label={SETTINGS_NOTIFICATIONS.promotions}
          checked={promotions}
          onChange={setPromotions}
        />
      </div>
    </article>
  );
}
