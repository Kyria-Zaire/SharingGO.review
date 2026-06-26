import { Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { SETTINGS_DANGER } from "@/features/settings/constants/settings-content";

const CARD_CLASS = cn(
  landingCardClass,
  "mt-8 border-destructive/25 bg-[#121212] p-5 sm:p-6"
);

export function SettingsDangerZone() {
  return (
    <article className={CARD_CLASS} aria-label={SETTINGS_DANGER.title}>
      <div className="flex items-start gap-3">
        <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <div className="flex-1">
          <h2 className="text-base font-semibold text-foreground">{SETTINGS_DANGER.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{SETTINGS_DANGER.deleteHint}</p>
          <p className="mt-2 text-xs text-muted-foreground">{SETTINGS_DANGER.deleteSoon}</p>
          <Button variant="destructive" className="mt-4 w-full sm:w-auto" disabled>
            {SETTINGS_DANGER.deleteAccount}
          </Button>
        </div>
      </div>
    </article>
  );
}
