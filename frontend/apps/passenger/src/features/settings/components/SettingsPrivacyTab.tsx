import { ChevronRight, Download, FileText, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { ProfileSoonBadge } from "@/features/profile/components/ProfileSoonBadge";
import { SETTINGS_PRIVACY } from "@/features/settings/constants/settings-content";

const CARD_CLASS = cn(landingCardClass, "mt-6 border-white/[0.08] bg-[#121212] p-5 sm:p-6");

function PrivacyRow({
  icon: Icon,
  label,
  showSoon = false,
}: {
  icon: typeof FileText;
  label: string;
  showSoon?: boolean;
}) {
  return (
    <button
      type="button"
      disabled
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border border-white/[0.06] bg-[#161616] p-4 text-left",
        "cursor-default"
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{label}</span>
      {showSoon ? <ProfileSoonBadge className="hidden sm:inline-flex" /> : null}
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}

export function SettingsPrivacyTab() {
  return (
    <article className={CARD_CLASS} aria-label={SETTINGS_PRIVACY.title}>
      <h2 className="text-lg font-semibold text-foreground">{SETTINGS_PRIVACY.title}</h2>

      <div className="mt-6 space-y-3">
        <PrivacyRow icon={ShieldCheck} label={SETTINGS_PRIVACY.privacyPolicy} />
        <PrivacyRow icon={FileText} label={SETTINGS_PRIVACY.terms} />

        <div className="rounded-xl border border-white/[0.06] bg-[#161616] p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Download className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{SETTINGS_PRIVACY.downloadData}</p>
              <p className="mt-1 text-xs text-muted-foreground">{SETTINGS_PRIVACY.downloadSoon}</p>
            </div>
            <ProfileSoonBadge className="hidden shrink-0 sm:inline-flex" />
          </div>
        </div>
      </div>
    </article>
  );
}
