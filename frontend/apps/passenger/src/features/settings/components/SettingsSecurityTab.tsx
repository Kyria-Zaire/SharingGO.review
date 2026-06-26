import { ChevronRight, KeyRound, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { ProfileSoonBadge } from "@/features/profile/components/ProfileSoonBadge";
import { SETTINGS_SECURITY } from "@/features/settings/constants/settings-content";

const CARD_CLASS = cn(landingCardClass, "mt-6 border-white/[0.08] bg-[#121212] p-5 sm:p-6");

function SecurityRow({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof KeyRound;
  title: string;
  description: string;
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
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <ProfileSoonBadge className="hidden shrink-0 sm:inline-flex" />
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}

export function SettingsSecurityTab() {
  return (
    <article className={CARD_CLASS} aria-label={SETTINGS_SECURITY.title}>
      <h2 className="text-lg font-semibold text-foreground">{SETTINGS_SECURITY.title}</h2>

      <div className="mt-6 space-y-3">
        <SecurityRow
          icon={KeyRound}
          title={SETTINGS_SECURITY.password}
          description={SETTINGS_SECURITY.passwordHint}
        />
        <SecurityRow
          icon={ShieldCheck}
          title={SETTINGS_SECURITY.twoFactor}
          description={SETTINGS_SECURITY.twoFactorHint}
        />
        <SecurityRow
          icon={MonitorSmartphone}
          title={SETTINGS_SECURITY.sessions}
          description={SETTINGS_SECURITY.sessionsHint}
        />
      </div>
    </article>
  );
}
