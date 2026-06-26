import { ChevronRight, KeyRound, MonitorSmartphone, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { ProfileSoonBadge } from "@/features/profile/components/ProfileSoonBadge";
import { PROFILE_EDIT_SECURITY } from "@/features/profile/edit/constants/profile-edit-content";

const CARD_CLASS = cn(landingCardClass, "border-white/[0.08] bg-[#121212] p-5 sm:p-6");

const soonIntroClass =
  "rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground";

function SecurityActionRow({
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
        "cursor-default opacity-95"
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <ProfileSoonBadge className="hidden sm:inline-flex" />
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}

export function ProfileEditSecurityTab({
  showMobileDelete,
}: {
  showMobileDelete?: boolean;
}) {
  return (
    <article className={cn(CARD_CLASS, "mt-6 max-w-2xl")} aria-label={PROFILE_EDIT_SECURITY.title}>
      <h2 className="text-lg font-semibold text-foreground">{PROFILE_EDIT_SECURITY.title}</h2>

      <p className={cn(soonIntroClass, "mt-4")} role="status">
        {PROFILE_EDIT_SECURITY.soonIntro}
      </p>

      <div className="mt-6 space-y-3">
        <SecurityActionRow
          icon={KeyRound}
          title={PROFILE_EDIT_SECURITY.changePassword}
          description={PROFILE_EDIT_SECURITY.changePasswordHint}
        />
        <SecurityActionRow
          icon={ShieldCheck}
          title={PROFILE_EDIT_SECURITY.twoFactor}
          description={PROFILE_EDIT_SECURITY.twoFactorHint}
        />
        <SecurityActionRow
          icon={MonitorSmartphone}
          title={PROFILE_EDIT_SECURITY.devices}
          description={PROFILE_EDIT_SECURITY.devicesHint}
        />
      </div>

      <div
        className={cn(
          "mt-8 rounded-xl border border-destructive/25 bg-destructive/5 p-4",
          showMobileDelete ? "block" : "hidden lg:block"
        )}
      >
        <div className="flex items-start gap-3">
          <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {PROFILE_EDIT_SECURITY.deleteAccount}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {PROFILE_EDIT_SECURITY.deleteAccountHint}
            </p>
            <Button variant="destructive" className="mt-4 w-full sm:w-auto" disabled>
              {PROFILE_EDIT_SECURITY.deleteAccount}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
