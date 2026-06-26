import { ChevronRight, ExternalLink, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { SETTINGS_ABOUT } from "@/features/settings/constants/settings-content";
import { settingsReadOnlyInputClass } from "@/features/settings/lib/settings-form";

const CARD_CLASS = cn(landingCardClass, "mt-6 border-white/[0.08] bg-[#121212] p-5 sm:p-6");

function AboutLinkRow({
  icon: Icon,
  label,
}: {
  icon: typeof ExternalLink;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled
      title={SETTINGS_ABOUT.linkSoon}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border border-white/[0.06] bg-[#161616] p-4 text-left",
        "cursor-not-allowed opacity-80"
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{label}</span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}

export function SettingsAboutTab() {
  return (
    <article className={CARD_CLASS} aria-label={SETTINGS_ABOUT.title}>
      <h2 className="text-lg font-semibold text-foreground">{SETTINGS_ABOUT.title}</h2>

      <div className="mt-6 space-y-5">
        <div>
          <p className="text-sm font-medium text-foreground">{SETTINGS_ABOUT.appName}</p>
          <label htmlFor="settings-version" className="mt-4 block text-xs text-muted-foreground">
            {SETTINGS_ABOUT.versionLabel}
          </label>
          <input
            id="settings-version"
            type="text"
            readOnly
            value={SETTINGS_ABOUT.version}
            className={settingsReadOnlyInputClass}
          />
        </div>

        <p className="text-sm text-muted-foreground">{SETTINGS_ABOUT.copyright}</p>

        <div className="space-y-3">
          <AboutLinkRow icon={ExternalLink} label={SETTINGS_ABOUT.legal} />
          <AboutLinkRow icon={LifeBuoy} label={SETTINGS_ABOUT.support} />
        </div>
      </div>
    </article>
  );
}
