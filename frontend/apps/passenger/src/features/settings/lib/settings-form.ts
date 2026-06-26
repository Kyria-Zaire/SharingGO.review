import { isGoogleOAuthSession } from "@/features/profile/edit/lib/profile-edit-form";
import { SETTINGS_ACCOUNT } from "@/features/settings/constants/settings-content";

export { isGoogleOAuthSession };

export function resolveAccountProviderLabel(): string {
  return isGoogleOAuthSession() ? SETTINGS_ACCOUNT.providerGoogle : SETTINGS_ACCOUNT.providerEmail;
}

export function resolveAccountSyncLabel(): string {
  return isGoogleOAuthSession() ? SETTINGS_ACCOUNT.syncedGoogle : SETTINGS_ACCOUNT.synced;
}

export function formatLastLoginLabel(date: Date): string {
  const today = new Date();
  const isToday =
    date.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" }) ===
    today.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });

  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(date);

  if (isToday) {
    return `Aujourd'hui à ${time}`;
  }

  const day = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  }).format(date);

  return `${day} à ${time}`;
}

export const settingsReadOnlyInputClass =
  "mt-1.5 w-full cursor-default rounded-lg border border-white/[0.1] bg-[#161616] px-4 py-3 text-sm text-foreground opacity-90 focus-visible:outline-none";

export const settingsSoonMessageClass =
  "rounded-xl border border-white/[0.08] bg-[#161616] px-4 py-3 text-sm text-muted-foreground";
