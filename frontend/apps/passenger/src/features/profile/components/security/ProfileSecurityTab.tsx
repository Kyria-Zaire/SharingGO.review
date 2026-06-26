import { KeyRound, MonitorSmartphone, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { ProfileSoonBadge } from "@/features/profile/components/ProfileSoonBadge";
import { PROFILE_SECURITY } from "@/features/profile/constants/profile-content";

const CARD_CLASS = cn(landingCardClass, "border-white/[0.08] bg-[#121212] p-5 sm:p-6");

const soonIntroClass =
  "rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground";

function SecurityRow({
  icon: Icon,
  title,
  description,
  destructive = false,
}: {
  icon: typeof KeyRound;
  title: string;
  description: string;
  destructive?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border bg-[#161616] p-4 sm:flex-row sm:items-center sm:justify-between",
        destructive ? "border-destructive/25" : "border-white/[0.06]"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
            destructive
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-primary/30 bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <ProfileSoonBadge />
    </div>
  );
}

export function ProfileSecurityTab() {
  return (
    <article className={cn(CARD_CLASS, "mt-6 max-w-2xl")} aria-label={PROFILE_SECURITY.title}>
      <h2 className="text-lg font-semibold text-foreground">{PROFILE_SECURITY.title}</h2>

      <p className={cn(soonIntroClass, "mt-4")} role="status">
        {PROFILE_SECURITY.soonIntro}
      </p>

      <div className="mt-6 space-y-4">
        <SecurityRow
          icon={KeyRound}
          title={PROFILE_SECURITY.changePassword}
          description={PROFILE_SECURITY.changePasswordHint}
        />

        <SecurityRow
          icon={MonitorSmartphone}
          title={PROFILE_SECURITY.devices}
          description={PROFILE_SECURITY.devicesPlaceholder}
        />

        <SecurityRow
          icon={Trash2}
          title={PROFILE_SECURITY.deleteAccount}
          description={PROFILE_SECURITY.deleteAccountHint}
          destructive
        />
      </div>
    </article>
  );
}
