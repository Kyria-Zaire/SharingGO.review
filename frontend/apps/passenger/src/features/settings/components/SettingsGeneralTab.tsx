import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import {
  SETTINGS_GENERAL,
} from "@/features/settings/constants/settings-content";
import {
  settingsReadOnlyInputClass,
  settingsSoonMessageClass,
} from "@/features/settings/lib/settings-form";

const CARD_CLASS = cn(landingCardClass, "mt-6 border-white/[0.08] bg-[#121212] p-5 sm:p-6");

export function SettingsGeneralTab() {
  return (
    <article className={CARD_CLASS} aria-label={SETTINGS_GENERAL.appearanceTitle}>
      <h2 className="text-lg font-semibold text-foreground">{SETTINGS_GENERAL.appearanceTitle}</h2>
      <p className={cn(settingsSoonMessageClass, "mt-4")} role="status">
        {SETTINGS_GENERAL.soonMessage}
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="settings-theme" className="text-sm font-medium text-foreground">
            {SETTINGS_GENERAL.theme}
          </label>
          <input
            id="settings-theme"
            type="text"
            readOnly
            value={SETTINGS_GENERAL.themeValue}
            className={settingsReadOnlyInputClass}
          />
        </div>

        <div>
          <label htmlFor="settings-language" className="text-sm font-medium text-foreground">
            {SETTINGS_GENERAL.language}
          </label>
          <input
            id="settings-language"
            type="text"
            readOnly
            value={SETTINGS_GENERAL.languageValue}
            className={settingsReadOnlyInputClass}
          />
        </div>

        <div>
          <label htmlFor="settings-distance" className="text-sm font-medium text-foreground">
            {SETTINGS_GENERAL.distance}
          </label>
          <input
            id="settings-distance"
            type="text"
            readOnly
            value={SETTINGS_GENERAL.distanceValue}
            className={settingsReadOnlyInputClass}
          />
        </div>
      </div>
    </article>
  );
}
