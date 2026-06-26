import { useMemo } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { SETTINGS_ACCOUNT } from "@/features/settings/constants/settings-content";
import {
  formatLastLoginLabel,
  resolveAccountProviderLabel,
  resolveAccountSyncLabel,
} from "@/features/settings/lib/settings-form";
import type { PassengerUser } from "@/types/auth";

const CARD_CLASS = cn(landingCardClass, "border-white/[0.08] bg-[#121212] p-5 sm:p-6");

export function SettingsAccountCard({ user }: { user: PassengerUser }) {
  const lastLogin = useMemo(() => formatLastLoginLabel(new Date()), []);
  const provider = resolveAccountProviderLabel();
  const syncLabel = resolveAccountSyncLabel();

  return (
    <article className={CARD_CLASS} aria-label={SETTINGS_ACCOUNT.title}>
      <h2 className="text-base font-semibold text-foreground">{SETTINGS_ACCOUNT.title}</h2>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <ProfileAvatar user={user} size="xl" />

        <dl className="min-w-0 flex-1 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">Fournisseur</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">{provider}</dd>
              <dd className="mt-1 text-xs text-primary">{syncLabel}</dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">{SETTINGS_ACCOUNT.lastLogin}</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">{lastLogin}</dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{SETTINGS_ACCOUNT.email}</dt>
              <dd className="mt-0.5 truncate text-sm font-medium text-foreground">{user.email}</dd>
            </div>
          </div>
        </dl>
      </div>
    </article>
  );
}
